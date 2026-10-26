package com.gunpla.mobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gunpla.mobile.data.api.GunplaApiClient
import com.gunpla.mobile.data.model.LoginRequest
import com.gunpla.mobile.data.model.SystemDatabaseStats
import com.gunpla.mobile.data.storage.AppTenant
import com.gunpla.mobile.data.storage.SessionManager
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(
    sessionManager: SessionManager,
    apiClient: GunplaApiClient,
    onTenantChanged: (AppTenant) -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    var username by remember { mutableStateOf(sessionManager.username ?: "") }
    var password by remember { mutableStateOf("") }
    var apiUrlInput by remember { mutableStateOf(sessionManager.apiBaseUrl) }
    var isLoggingIn by remember { mutableStateOf(false) }
    var loginMessage by remember { mutableStateOf<String?>(null) }
    var dbStats by remember { mutableStateOf<SystemDatabaseStats?>(null) }

    fun checkServer() {
        coroutineScope.launch {
            val res = apiClient.getSystemDatabaseStats()
            res.onSuccess { dbStats = it }
        }
    }

    LaunchedEffect(Unit) {
        checkServer()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Text(
            text = "Perfil & Conexión SSO",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Tenant Selector
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Comunidad Activa (Multi-Tenant)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "Cambia el tema visual y el catálogo en tiempo real:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            sessionManager.tenant = AppTenant.GUNPLA_JUNKIES
                            onTenantChanged(AppTenant.GUNPLA_JUNKIES)
                        },
                        modifier = Modifier.weight(1f),
                        colors = if (sessionManager.tenant == AppTenant.GUNPLA_JUNKIES) ButtonDefaults.buttonColors() else ButtonDefaults.outlinedButtonColors()
                    ) {
                        Text("GunplaJunkies", fontSize = 11.sp)
                    }

                    Button(
                        onClick = {
                            sessionManager.tenant = AppTenant.PLAMO_SCALE
                            onTenantChanged(AppTenant.PLAMO_SCALE)
                        },
                        modifier = Modifier.weight(1f),
                        colors = if (sessionManager.tenant == AppTenant.PLAMO_SCALE) ButtonDefaults.buttonColors() else ButtonDefaults.outlinedButtonColors()
                    ) {
                        Text("PlamoScale", fontSize = 11.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Authentication Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                if (sessionManager.isLoggedIn()) {
                    Text(text = "Sesión Activa", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Text(text = "Modelista: ${sessionManager.displayName}")
                    Text(text = "Usuario: @${sessionManager.username}")
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = {
                            sessionManager.clearSession()
                            username = ""
                            password = ""
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                    ) {
                        Text("Cerrar Sesión")
                    }
                } else {
                    Text(text = "Iniciar Sesión SSO", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = username,
                        onValueChange = { username = it },
                        label = { Text("Usuario o Email") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Contraseña") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isLoggingIn = true
                                    loginMessage = null
                                    val res = apiClient.login(LoginRequest(username, password))
                                    res.onSuccess {
                                        sessionManager.token = it.token
                                        sessionManager.username = it.user.username
                                        sessionManager.displayName = it.user.displayName
                                        loginMessage = "¡Bienvenido, ${it.user.displayName}!"
                                    }.onFailure {
                                        loginMessage = it.message ?: "Error al conectar"
                                    }
                                    isLoggingIn = false
                                }
                            },
                            modifier = Modifier.weight(1f),
                            enabled = !isLoggingIn && username.isNotBlank() && password.isNotBlank()
                        ) {
                            Text("Entrar")
                        }

                        // 1-Click Founder Test Login
                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isLoggingIn = true
                                    loginMessage = null
                                    username = "aperich"
                                    password = "PlamoScaleDev2026!"
                                    val res = apiClient.login(LoginRequest("aperich", "PlamoScaleDev2026!"))
                                    res.onSuccess {
                                        sessionManager.token = it.token
                                        sessionManager.username = it.user.username
                                        sessionManager.displayName = it.user.displayName
                                        loginMessage = "¡Bienvenido Aldo Perich!"
                                    }.onFailure {
                                        loginMessage = it.message ?: "Error al conectar con API"
                                    }
                                    isLoggingIn = false
                                }
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                            enabled = !isLoggingIn
                        ) {
                            Text("1-Click aperich", fontSize = 11.sp)
                        }
                    }

                    if (loginMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = loginMessage ?: "", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Server Diagnostics Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Servidor Central & Diagnóstico", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Spacer(modifier = Modifier.height(6.dp))
                OutlinedTextField(
                    value = apiUrlInput,
                    onValueChange = {
                        apiUrlInput = it
                        sessionManager.apiBaseUrl = it
                    },
                    label = { Text("Dirección API Central") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                Spacer(modifier = Modifier.height(8.dp))
                if (dbStats != null) {
                    Text("• Base de Datos: ${dbStats?.engine} (${dbStats?.mode})", fontSize = 12.sp)
                    Text("• Capa de Caching: ${dbStats?.cache?.engine ?: "Redis 7"} (Conectado: ${dbStats?.cache?.connected ?: true})", fontSize = 12.sp)
                    Text("• Latencia Servidor: ${dbStats?.latencyMs} ms", fontSize = 12.sp)
                } else {
                    Text("Conectando con http://192.168.1.190:8080...", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}
