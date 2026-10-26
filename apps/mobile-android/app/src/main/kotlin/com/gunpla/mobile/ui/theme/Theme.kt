package com.gunpla.mobile.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import com.gunpla.mobile.data.storage.AppTenant

private val GunplaJunkiesColorScheme = darkColorScheme(
    primary = GunplaCyberCyan,
    onPrimary = androidx.compose.ui.graphics.Color.Black,
    secondary = GunplaCyberCrimson,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = GunplaDarkBackground,
    surface = GunplaDarkSurface,
    surfaceVariant = GunplaDarkSurfaceVariant,
    onBackground = GunplaDarkText,
    onSurface = GunplaDarkText,
    onSurfaceVariant = GunplaDarkMuted
)

private val PlamoScaleColorScheme = darkColorScheme(
    primary = PlamoSkyBlue,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    secondary = PlamoIndustrialOrange,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    background = PlamoSlateBackground,
    surface = PlamoSlateSurface,
    surfaceVariant = PlamoSlateSurfaceVariant,
    onBackground = PlamoSlateText,
    onSurface = PlamoSlateText,
    onSurfaceVariant = PlamoSlateMuted
)

@Composable
fun GunplaMobileTheme(
    tenant: AppTenant = AppTenant.GUNPLA_JUNKIES,
    content: @Composable () -> Unit
) {
    val colorScheme = when (tenant) {
        AppTenant.GUNPLA_JUNKIES -> GunplaJunkiesColorScheme
        AppTenant.PLAMO_SCALE -> PlamoScaleColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
