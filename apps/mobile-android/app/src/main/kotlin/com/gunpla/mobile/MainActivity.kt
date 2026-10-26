package com.gunpla.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.gunpla.mobile.data.api.GunplaApiClient
import com.gunpla.mobile.data.storage.AppTenant
import com.gunpla.mobile.data.storage.SessionManager
import com.gunpla.mobile.ui.screens.CatalogScreen
import com.gunpla.mobile.ui.screens.ProfileScreen
import com.gunpla.mobile.ui.screens.StashScreen
import com.gunpla.mobile.ui.screens.WorkbenchScreen
import com.gunpla.mobile.ui.theme.GunplaMobileTheme

enum class BottomTab(val title: String, val emoji: String) {
    WORKBENCH("Taller", "🛠️"),
    STASH("Stash", "📦"),
    CATALOG("Catálogo", "📖"),
    PROFILE("Perfil", "👤")
}

class MainActivity : ComponentActivity() {
    private lateinit var sessionManager: SessionManager
    private lateinit var apiClient: GunplaApiClient

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        sessionManager = SessionManager(applicationContext)
        apiClient = GunplaApiClient { sessionManager.apiBaseUrl }

        setContent {
            var currentTenant by remember { mutableStateOf(sessionManager.tenant) }
            var currentTab by remember { mutableStateOf(BottomTab.WORKBENCH) }

            GunplaMobileTheme(tenant = currentTenant) {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    topBar = {
                        TopAppBar(
                            title = {
                                Text(
                                    text = currentTenant.displayName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 18.sp
                                )
                            },
                            actions = {
                                TextButton(
                                    onClick = {
                                        val nextTenant = if (currentTenant == AppTenant.GUNPLA_JUNKIES) {
                                            AppTenant.PLAMO_SCALE
                                        } else {
                                            AppTenant.GUNPLA_JUNKIES
                                        }
                                        currentTenant = nextTenant
                                        sessionManager.tenant = nextTenant
                                    }
                                ) {
                                    Text(
                                        text = if (currentTenant == AppTenant.GUNPLA_JUNKIES) "🤖 Gunpla" else "✈️ Plamo",
                                        color = MaterialTheme.colorScheme.primary,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.surface
                            )
                        )
                    },
                    bottomBar = {
                        NavigationBar(
                            containerColor = MaterialTheme.colorScheme.surface
                        ) {
                            BottomTab.values().forEach { tab ->
                                NavigationBarItem(
                                    icon = { Text(tab.emoji, fontSize = 20.sp) },
                                    label = { Text(tab.title, fontSize = 11.sp) },
                                    selected = currentTab == tab,
                                    onClick = { currentTab = tab },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedTextColor = MaterialTheme.colorScheme.primary,
                                        indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                                    )
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    val modifier = Modifier.padding(innerPadding)
                    when (currentTab) {
                        BottomTab.WORKBENCH -> WorkbenchScreen(sessionManager, apiClient, modifier)
                        BottomTab.STASH -> StashScreen(sessionManager, modifier)
                        BottomTab.CATALOG -> CatalogScreen(sessionManager, apiClient, modifier)
                        BottomTab.PROFILE -> ProfileScreen(sessionManager, apiClient, onTenantChanged = { currentTenant = it }, modifier)
                    }
                }
            }
        }
    }
}
