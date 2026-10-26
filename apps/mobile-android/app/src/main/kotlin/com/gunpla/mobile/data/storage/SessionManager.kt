package com.gunpla.mobile.data.storage

import android.content.Context
import android.content.SharedPreferences

enum class AppTenant(val slug: String, val displayName: String, val tagline: String) {
    GUNPLA_JUNKIES("gunplajunkies", "GunplaJunkies", "Universo Gunpla & Sci-Fi Mecha"),
    PLAMO_SCALE("plamoscale", "PlamoScale", "Comunidad de Modelismo a Escala")
}

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("gunpla_mobile_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_JWT_TOKEN = "jwt_token"
        private const val KEY_USERNAME = "username"
        private const val KEY_DISPLAY_NAME = "display_name"
        private const val KEY_TENANT = "tenant_slug"
        private const val KEY_API_URL = "api_base_url"
        const val DEFAULT_API_URL = "http://192.168.1.190:8080"
    }

    var token: String?
        get() = prefs.getString(KEY_JWT_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_JWT_TOKEN, value).apply()

    var username: String?
        get() = prefs.getString(KEY_USERNAME, null)
        set(value) = prefs.edit().putString(KEY_USERNAME, value).apply()

    var displayName: String?
        get() = prefs.getString(KEY_DISPLAY_NAME, "Modelista Invitado")
        set(value) = prefs.edit().putString(KEY_DISPLAY_NAME, value).apply()

    var tenant: AppTenant
        get() {
            val slug = prefs.getString(KEY_TENANT, AppTenant.GUNPLA_JUNKIES.slug)
            return AppTenant.values().firstOrNull { it.slug == slug } ?: AppTenant.GUNPLA_JUNKIES
        }
        set(value) = prefs.edit().putString(KEY_TENANT, value.slug).apply()

    var apiBaseUrl: String
        get() = prefs.getString(KEY_API_URL, DEFAULT_API_URL) ?: DEFAULT_API_URL
        set(value) = prefs.edit().putString(KEY_API_URL, value).apply()

    fun isLoggedIn(): Boolean = !token.isNullOrBlank()

    fun clearSession() {
        prefs.edit()
            .remove(KEY_JWT_TOKEN)
            .remove(KEY_USERNAME)
            .remove(KEY_DISPLAY_NAME)
            .apply()
    }
}
