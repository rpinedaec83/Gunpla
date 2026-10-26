package com.gunpla.mobile.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gunpla.mobile.data.storage.SessionManager

data class StashItemMock(
    val name: String,
    val brand: String,
    val scale: String,
    val status: String,
    val progress: Int
)

@Composable
fun StashScreen(
    sessionManager: SessionManager,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("all") }

    val sampleStash = remember {
        listOf(
            StashItemMock("RG 1/144 Hi-Nu Gundam", "Bandai Spirits", "1/144", "in_progress", 65),
            StashItemMock("MG 1/100 Sazabi Ver.Ka", "Bandai", "1/100", "unbuilt", 0),
            StashItemMock("Tiger I Ausf.E Mid Production", "Tamiya", "1/35", "unbuilt", 0),
            StashItemMock("Super Hornet F/A-18F", "Hasegawa", "1/48", "completed", 100)
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Mi Stash Personal",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Filter chips
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                selected = selectedFilter == "all",
                onClick = { selectedFilter = "all" },
                label = { Text("Todas (4)", fontSize = 12.sp) }
            )
            FilterChip(
                selected = selectedFilter == "in_progress",
                onClick = { selectedFilter = "in_progress" },
                label = { Text("En Proceso (1)", fontSize = 12.sp) }
            )
            FilterChip(
                selected = selectedFilter == "unbuilt",
                onClick = { selectedFilter = "unbuilt" },
                label = { Text("En Caja (2)", fontSize = 12.sp) }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            val filtered = if (selectedFilter == "all") sampleStash else sampleStash.filter { it.status == selectedFilter }
            items(filtered.size) { i ->
                val item = filtered[i]
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(item.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(item.scale, color = MaterialTheme.colorScheme.primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Text("${item.brand} • ${if (item.status == "in_progress") "Armando (${item.progress}%)" else if (item.status == "unbuilt") "En Caja" else "Finalizado"}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        if (item.status == "in_progress") {
                            Spacer(modifier = Modifier.height(6.dp))
                            LinearProgressIndicator(
                                progress = { item.progress / 100f },
                                modifier = Modifier.fillMaxWidth().height(4.dp),
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }
    }
}
