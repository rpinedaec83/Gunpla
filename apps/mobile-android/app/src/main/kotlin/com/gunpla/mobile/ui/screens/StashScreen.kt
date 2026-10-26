package com.gunpla.mobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gunpla.mobile.data.api.GunplaApiClient
import com.gunpla.mobile.data.model.LoginRequest
import com.gunpla.mobile.data.model.StashItemDto
import com.gunpla.mobile.data.model.UpdateStashRequest
import com.gunpla.mobile.data.storage.SessionManager
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StashScreen(
    sessionManager: SessionManager,
    apiClient: GunplaApiClient,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var stashItems by remember { mutableStateOf<List<StashItemDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var selectedFilter by remember { mutableStateOf("all") }
    var searchQuery by remember { mutableStateOf("") }
    var editingItem by remember { mutableStateOf<StashItemDto?>(null) }

    fun loadStash() {
        val token = sessionManager.token
        if (token.isNullOrBlank()) {
            errorMessage = "No has iniciado sesion. Inicia sesion para ver tu Stash real."
            stashItems = emptyList()
            return
        }
        coroutineScope.launch {
            isLoading = true
            errorMessage = null
            val result = apiClient.getStashItems(token, if (selectedFilter == "all") null else selectedFilter)
            result.onSuccess {
                stashItems = it.items
                isLoading = false
            }.onFailure { err ->
                errorMessage = err.message ?: "Error al conectar con la API central."
                isLoading = false
            }
        }
    }

    LaunchedEffect(sessionManager.token, selectedFilter) {
        loadStash()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Encabezado
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Mi Stash Personal",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Sincronizado con API Central",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.secondary
                )
            }

            Button(
                onClick = { loadStash() },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Recargar", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Si no esta autenticado, mostrar tarjeta con acceso rapido
        if (sessionManager.token.isNullOrBlank()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "🔒 Sesion Requerida",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Para gestionar tu coleccion de maquetas en la nube, inicia sesion con tu cuenta de modelista.",
                        fontSize = 12.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            coroutineScope.launch {
                                isLoading = true
                                val res = apiClient.login(LoginRequest("demo.builder", "builder123"))
                                res.onSuccess {
                                    sessionManager.token = it.token
                                    sessionManager.username = it.user.username
                                    sessionManager.displayName = it.user.displayName
                                    loadStash()
                                }
                                isLoading = false
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text("Iniciar Sesion Rapida (Demo Builder)", fontSize = 12.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Buscador
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Buscar por nombre, marca o escala...", fontSize = 13.sp) },
            singleLine = true,
            shape = RoundedCornerShape(8.dp)
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Filtros por estado
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val allCount = stashItems.size
            val inProgressCount = stashItems.count { it.status == "in_progress" }
            val unbuiltCount = stashItems.count { it.status == "unbuilt" }
            val builtCount = stashItems.count { it.status == "built" }

            FilterChip(
                selected = selectedFilter == "all",
                onClick = { selectedFilter = "all" },
                label = { Text("Todas ($allCount)", fontSize = 11.sp) }
            )
            FilterChip(
                selected = selectedFilter == "in_progress",
                onClick = { selectedFilter = "in_progress" },
                label = { Text("Armando ($inProgressCount)", fontSize = 11.sp) }
            )
            FilterChip(
                selected = selectedFilter == "unbuilt",
                onClick = { selectedFilter = "unbuilt" },
                label = { Text("En Caja ($unbuiltCount)", fontSize = 11.sp) }
            )
            FilterChip(
                selected = selectedFilter == "built",
                onClick = { selectedFilter = "built" },
                label = { Text("Vitrina ($builtCount)", fontSize = 11.sp) }
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Contenido / Lista
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (errorMessage != null && stashItems.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(errorMessage ?: "", color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { loadStash() }) {
                        Text("Reintentar")
                    }
                }
            }
        } else if (stashItems.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = if (sessionManager.token.isNullOrBlank()) "Inicia sesion arriba para cargar tu Stash." else "No hay maquetas registradas en este estado.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            }
        } else {
            val filteredList = stashItems.filter { item ->
                val kitName = item.kit?.name ?: "Kit Desconocido"
                val brand = item.kit?.brand ?: ""
                val scale = item.kit?.scale ?: ""
                val notes = item.notes ?: ""
                val matchesFilter = selectedFilter == "all" || item.status == selectedFilter
                val matchesSearch = searchQuery.isBlank() ||
                        kitName.contains(searchQuery, ignoreCase = true) ||
                        brand.contains(searchQuery, ignoreCase = true) ||
                        scale.contains(searchQuery, ignoreCase = true) ||
                        notes.contains(searchQuery, ignoreCase = true)
                matchesFilter && matchesSearch
            }

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredList) { item ->
                    StashItemCard(
                        item = item,
                        onEditClick = { editingItem = item }
                    )
                }
            }
        }
    }

    // Modal para editar progreso / estado
    editingItem?.let { item ->
        var currentProgress by remember { mutableStateOf(item.progress) }
        var currentStatus by remember { mutableStateOf(item.status) }
        var isSaving by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { editingItem = null },
            title = {
                Text(
                    text = item.kit?.name ?: "Actualizar Maqueta",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column {
                    Text(
                        text = "Estado actual:",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilterChip(
                            selected = currentStatus == "unbuilt",
                            onClick = { currentStatus = "unbuilt"; currentProgress = 0 },
                            label = { Text("En Caja", fontSize = 11.sp) }
                        )
                        FilterChip(
                            selected = currentStatus == "in_progress",
                            onClick = { currentStatus = "in_progress" },
                            label = { Text("Armando", fontSize = 11.sp) }
                        )
                        FilterChip(
                            selected = currentStatus == "built",
                            onClick = { currentStatus = "built"; currentProgress = 100 },
                            label = { Text("Vitrina", fontSize = 11.sp) }
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Progreso de armado: $currentProgress%",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Slider(
                        value = currentProgress.toFloat(),
                        onValueChange = { currentProgress = it.toInt() },
                        valueRange = 0f..100f,
                        steps = 9
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            isSaving = true
                            val req = UpdateStashRequest(
                                status = currentStatus,
                                progress = currentProgress
                            )
                            val res = apiClient.updateStashItem(sessionManager.token, item.id, req)
                            res.onSuccess { updated ->
                                stashItems = stashItems.map { if (it.id == updated.id) updated else it }
                                editingItem = null
                            }
                            isSaving = false
                        }
                    },
                    enabled = !isSaving
                ) {
                    Text(if (isSaving) "Guardando..." else "Guardar")
                }
            },
            dismissButton = {
                TextButton(onClick = { editingItem = null }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@Composable
fun StashItemCard(
    item: StashItemDto,
    onEditClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val kit = item.kit
    val statusColor = when (item.status) {
        "built" -> MaterialTheme.colorScheme.tertiary
        "in_progress" -> MaterialTheme.colorScheme.primary
        "unbuilt" -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.outline
    }
    val statusLabel = when (item.status) {
        "built" -> "Vitrina (100%)"
        "in_progress" -> "Armando (${item.progress}%)"
        "unbuilt" -> "En Caja (Sellado)"
        "for_trade" -> "Para Canje"
        "wishlist" -> "Lista de Deseos"
        else -> item.status
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onEditClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = kit?.name ?: "Maqueta #${item.kitId.take(8)}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = kit?.scale ?: "1/144",
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${kit?.brand ?: "Bandai Spirits"} • ${kit?.grade ?: kit?.category ?: "Mecha"}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (item.acquisitionPrice != null && item.acquisitionPrice > 0.0) {
                    Text(
                        text = "$${String.format("%.2f", item.acquisitionPrice)}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = statusLabel,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = statusColor
                )
                Text(
                    text = "✏️ Tocar para editar",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (item.status == "in_progress" || item.status == "built") {
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { item.progress / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(5.dp),
                    color = statusColor
                )
            }
        }
    }
}
