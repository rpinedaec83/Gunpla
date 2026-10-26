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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gunpla.mobile.data.api.GunplaApiClient
import com.gunpla.mobile.data.model.ToolDto
import com.gunpla.mobile.data.storage.AppTenant
import com.gunpla.mobile.data.storage.SessionManager
import kotlinx.coroutines.launch

@Composable
fun WorkbenchScreen(
    sessionManager: SessionManager,
    apiClient: GunplaApiClient,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var tools by remember { mutableStateOf<List<ToolDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    fun refreshTools() {
        coroutineScope.launch {
            isLoading = true
            statusMessage = null
            val result = apiClient.getWorkbenchTools(sessionManager.token)
            result.onSuccess {
                tools = it.items
                isLoading = false
            }.onFailure {
                statusMessage = "Conectado offline (API ${sessionManager.apiBaseUrl})"
                isLoading = false
            }
        }
    }

    LaunchedEffect(sessionManager.tenant, sessionManager.token) {
        refreshTools()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Workshop Header Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Mesa de Trabajo",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = if (sessionManager.isLoggedIn()) sessionManager.displayName ?: "Modelista" else "Modo Invitado",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Button(
                        onClick = { refreshTools() },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Text("Sincronizar", fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    KpiChip(label = "Herramientas", value = tools.size.toString())
                    KpiChip(label = "En Proceso", value = "2")
                    KpiChip(label = "Cuchillas", value = "100%")
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Herramientas de Precisión & Desgaste",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (isLoading) {
            Box(modifier = Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        } else if (tools.isEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Arsenal de Taller Inicial:", fontWeight = FontWeight.Bold)
                    Text("• GodHand Ultimate Nipper SPN-120 (Corte fino)")
                    Text("• Olfa AK-4 Cuchilla Artística (Bisturí #11)")
                    Text("• Gunprimer Raser Plus (Lija de vidrio)")
                    Text("• Mr. Hobby Procon Boy WA 0.3mm (Aerógrafo)")
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(tools) { tool ->
                    ToolItemCard(tool = tool)
                }
            }
        }
    }
}

@Composable
fun KpiChip(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Text(text = label, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
fun ToolItemCard(tool: ToolDto) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = tool.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = tool.brand, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
            }

            Spacer(modifier = Modifier.height(6.dp))

            val wearPct = tool.wearResult?.wearPercentage ?: 0
            val wearColor = when {
                wearPct < 50 -> Color(0xFF22C55E) // Green
                wearPct < 80 -> Color(0xFFEAB308) // Yellow
                else -> Color(0xFFEF4444)         // Red
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = "Vida útil de cuchilla: ${100 - wearPct}%", fontSize = 11.sp)
                Text(text = tool.wearResult?.conditionSuggestion?.uppercase() ?: "BUENO", fontSize = 11.sp, color = wearColor, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(4.dp))

            LinearProgressIndicator(
                progress = { (100 - wearPct) / 100f },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                color = wearColor,
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}
