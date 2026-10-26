package com.gunpla.mobile.data.api

import com.gunpla.mobile.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class GunplaApiClient(private val baseUrlProvider: () -> String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    suspend fun login(req: LoginRequest): Result<LoginResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "${baseUrlProvider()}/api/v1/auth/login"
            val body = json.encodeToString(LoginRequest.serializer(), req).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(url)
                .post(body)
                .build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(LoginResponse.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("Error en autenticación: HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCatalogKits(tenantSlug: String): Result<CatalogResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "${baseUrlProvider()}/api/v1/catalog/kits"
            val request = Request.Builder()
                .url(url)
                .header("X-Tenant-Slug", tenantSlug)
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(CatalogResponse.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("Error al cargar catálogo: HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getWorkbenchTools(token: String?): Result<ToolsResponse> = withContext(Dispatchers.IO) {
        try {
            val url = "${baseUrlProvider()}/api/v1/workbench/tools"
            val builder = Request.Builder().url(url).get()
            if (!token.isNullOrBlank()) {
                builder.header("Authorization", "Bearer $token")
            }

            client.newCall(builder.build()).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(ToolsResponse.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSystemDatabaseStats(): Result<SystemDatabaseStats> = withContext(Dispatchers.IO) {
        try {
            val url = "${baseUrlProvider()}/api/v1/system/database"
            val request = Request.Builder().url(url).get().build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(SystemDatabaseStats.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getStashItems(token: String?, status: String? = null): Result<StashResponse> = withContext(Dispatchers.IO) {
        if (token.isNullOrBlank()) {
            return@withContext Result.failure(Exception("Debes iniciar sesion para ver tu Stash."))
        }
        try {
            val urlBuilder = StringBuilder("${baseUrlProvider()}/api/v1/workbench/stash")
            if (!status.isNullOrBlank() && status != "all") {
                urlBuilder.append("?status=$status")
            }
            val request = Request.Builder()
                .url(urlBuilder.toString())
                .header("Authorization", "Bearer $token")
                .get()
                .build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(StashResponse.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("Error al cargar Stash: HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateStashItem(token: String?, id: String, req: UpdateStashRequest): Result<StashItemDto> = withContext(Dispatchers.IO) {
        if (token.isNullOrBlank()) {
            return@withContext Result.failure(Exception("Debes iniciar sesion para actualizar tu Stash."))
        }
        try {
            val url = "${baseUrlProvider()}/api/v1/workbench/stash/$id"
            val body = json.encodeToString(UpdateStashRequest.serializer(), req).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(url)
                .header("Authorization", "Bearer $token")
                .patch(body)
                .build()

            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string() ?: ""
                if (response.isSuccessful) {
                    val parsed = json.decodeFromString(StashItemDto.serializer(), responseBody)
                    Result.success(parsed)
                } else {
                    Result.failure(Exception("Error al actualizar kit: HTTP ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
