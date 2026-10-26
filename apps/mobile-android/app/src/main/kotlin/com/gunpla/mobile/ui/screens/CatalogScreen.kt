package com.gunpla.mobile.ui.screens

import androidx.compose.foundation.background
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
import com.gunpla.mobile.data.model.KitDto
import com.gunpla.mobile.data.storage.SessionManager
import kotlinx.coroutines.launch

@Composable
fun CatalogScreen(
    sessionManager: SessionManager,
    apiClient: GunplaApiClient,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var kits by remember { mutableStateOf<List<KitDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    fun loadKits() {
        coroutineScope.launch {
            isLoading = true
            errorMessage = null
            val result = apiClient.getCatalogKits(sessionManager.tenant.slug)
            result.onSuccess {
                kits = it.items
                isLoading = false
            }.onFailure {
                errorMessage = "No se pudo conectar a ${sessionManager.apiBaseUrl}. Verifica la red Wi-Fi."
                isLoading = false
            }
        }
    }

    LaunchedEffect(sessionManager.tenant) {
        loadKits()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Catálogo Maestro",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Acelerado con Redis 7 (<2ms)",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.secondary
                )
            }

            Button(
                onClick = { loadKits() },
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) {
                Text("Recargar", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("Buscar maqueta, marca o escala...") },
            singleLine = true,
            shape = RoundedCornerShape(8.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        } else if (errorMessage != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Aviso de Conexión", fontWeight = FontWeight.Bold)
                    Text(text = errorMessage ?: "")
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { loadKits() }) {
                        Text("Reintentar")
                    }
                }
            }
        } else {
            val filteredKits = kits.filter {
                it.name.contains(searchQuery, ignoreCase = true) ||
                it.brand.contains(searchQuery, ignoreCase = true) ||
                it.scale.contains(searchQuery, ignoreCase = true)
            }

            Text(
                text = "${filteredKits.size} maquetas disponibles en ${sessionManager.tenant.displayName}",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredKits) { kit ->
                    KitItemCard(kit = kit)
                }
            }
        }
    }
}

@Composable
fun KitItemCard(kit: KitDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = kit.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "${kit.brand} • Escala ${kit.scale} • ${kit.grade ?: kit.category}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Surface(
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                shape = RoundedCornerShape(4.dp)
            ) {
                Text(
                    text = kit.scale,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
    }
}
