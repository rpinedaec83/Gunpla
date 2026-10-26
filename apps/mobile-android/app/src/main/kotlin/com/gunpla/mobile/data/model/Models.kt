package com.gunpla.mobile.data.model

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val identifier: String,
    val password: String
)

@Serializable
data class LoginResponse(
    val token: String,
    val user: UserDto
)

@Serializable
data class UserDto(
    val id: String,
    val username: String,
    val displayName: String,
    val email: String,
    val primaryTenantSlug: String? = null,
    val roles: List<String> = emptyList()
)

@Serializable
data class KitDto(
    val id: String,
    val name: String,
    val brand: String,
    val scale: String,
    val grade: String? = null,
    val category: String,
    val kitNumber: String? = null,
    val boxartUrl: String? = null
)

@Serializable
data class CatalogResponse(
    val items: List<KitDto> = emptyList(),
    val totalCount: Int = 0
)

@Serializable
data class ToolDto(
    val id: String,
    val name: String,
    val brand: String,
    val category: String,
    val status: String,
    val condition: String,
    val wearResult: ToolWearResult? = null
)

@Serializable
data class ToolWearResult(
    val wearPercentage: Int = 0,
    val remainingLifespanPct: Int = 100,
    val conditionSuggestion: String = "new",
    val isDullWarning: Boolean = false,
    val recommendedAction: String? = null
)

@Serializable
data class ToolsResponse(
    val items: List<ToolDto> = emptyList(),
    val total: Int = 0
)

@Serializable
data class SystemDatabaseStats(
    val engine: String = "PostgreSQL 16",
    val mode: String = "relational-postgres",
    val latencyMs: Int = 0,
    val cache: CacheStatsDto? = null
)

@Serializable
data class CacheStatsDto(
    val engine: String = "Redis 7",
    val connected: Boolean = true,
    val hits: Int = 0,
    val misses: Int = 0
)
