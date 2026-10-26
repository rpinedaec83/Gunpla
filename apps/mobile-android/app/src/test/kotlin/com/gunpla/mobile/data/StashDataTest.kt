package com.gunpla.mobile.data

import com.gunpla.mobile.data.model.KitDto
import com.gunpla.mobile.data.model.StashItemDto
import com.gunpla.mobile.data.model.StashResponse
import com.gunpla.mobile.data.model.UpdateStashRequest
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class StashDataTest {
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    @Test
    fun testStashResponseDeserialization() {
        val sampleJson = """
        {
          "items": [
            {
              "id": "stash-101",
              "userId": "user-builder-1",
              "kitId": "kit-rg-hinu",
              "status": "in_progress",
              "acquisitionPrice": 54.99,
              "notes": "Panel lineado y calcas al agua",
              "progress": 65,
              "kit": {
                "id": "kit-rg-hinu",
                "name": "RG 1/144 Hi-Nu Gundam",
                "brand": "Bandai Spirits",
                "scale": "1/144",
                "grade": "RG",
                "category": "gunpla-mecha",
                "boxartUrl": "https://cdn.gunpla.local/hinu.jpg"
              }
            },
            {
              "id": "stash-102",
              "userId": "user-builder-1",
              "kitId": "kit-mg-sazabi",
              "status": "unbuilt",
              "acquisitionPrice": 89.00,
              "notes": null,
              "progress": 0,
              "kit": {
                "id": "kit-mg-sazabi",
                "name": "MG 1/100 Sazabi Ver.Ka",
                "brand": "Bandai",
                "scale": "1/100",
                "grade": "MG",
                "category": "gunpla-mecha"
              }
            }
          ],
          "totalCount": 2
        }
        """.trimIndent()

        val response = json.decodeFromString(StashResponse.serializer(), sampleJson)
        assertEquals(2, response.totalCount)
        assertEquals(2, response.items.size)

        val first = response.items[0]
        assertEquals("stash-101", first.id)
        assertEquals("in_progress", first.status)
        assertEquals(65, first.progress)
        assertNotNull(first.kit)
        assertEquals("RG 1/144 Hi-Nu Gundam", first.kit?.name)
        assertEquals("Bandai Spirits", first.kit?.brand)
        assertEquals(54.99, first.acquisitionPrice ?: 0.0, 0.01)

        val second = response.items[1]
        assertEquals("stash-102", second.id)
        assertEquals("unbuilt", second.status)
        assertEquals(0, second.progress)
    }

    @Test
    fun testUpdateStashRequestSerialization() {
        val request = UpdateStashRequest(
            status = "built",
            progress = 100,
            notes = "Finalizado con capa transparente mate"
        )
        val serialized = json.encodeToString(UpdateStashRequest.serializer(), request)
        assertTrue(serialized.contains("\"status\":\"built\""))
        assertTrue(serialized.contains("\"progress\":100"))
        assertTrue(serialized.contains("Finalizado"))
    }

    @Test
    fun testStashFilteringAndSearchLogic() {
        val items = listOf(
            StashItemDto(
                id = "1",
                userId = "u1",
                kitId = "k1",
                status = "in_progress",
                progress = 40,
                kit = KitDto("k1", "Gundam Aerial", "Bandai", "1/144", "HG", "gunpla-mecha")
            ),
            StashItemDto(
                id = "2",
                userId = "u1",
                kitId = "k2",
                status = "unbuilt",
                progress = 0,
                kit = KitDto("k2", "Tiger I", "Tamiya", "1/35", null, "military")
            ),
            StashItemDto(
                id = "3",
                userId = "u1",
                kitId = "k3",
                status = "built",
                progress = 100,
                kit = KitDto("k3", "F-14 Tomcat", "Tamiya", "1/48", null, "aviation")
            )
        )

        // Filter by status
        val inProgress = items.filter { it.status == "in_progress" }
        assertEquals(1, inProgress.size)
        assertEquals("Gundam Aerial", inProgress[0].kit?.name)

        val unbuilt = items.filter { it.status == "unbuilt" }
        assertEquals(1, unbuilt.size)
        assertEquals("Tiger I", unbuilt[0].kit?.name)

        // Search query
        val query = "Tamiya"
        val searched = items.filter { item ->
            val name = item.kit?.name ?: ""
            val brand = item.kit?.brand ?: ""
            name.contains(query, ignoreCase = true) || brand.contains(query, ignoreCase = true)
        }
        assertEquals(2, searched.size)
    }
}
