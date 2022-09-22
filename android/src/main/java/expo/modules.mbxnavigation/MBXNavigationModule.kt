package expo.modules.mbxnavigation

import android.util.Log
import android.content.Context
import android.view.View

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import com.mapbox.maps.ResourceOptionsManager
import com.mapbox.maps.TileStoreUsageMode

class MBXNavigationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MBXNavigation")

    OnCreate {
      ResourceOptionsManager.getDefault(context, "pk.eyJ1IjoiZGVyc29ueSIsImEiOiJjbDdyaGZlemUwNDRmM3ZtaGd3ZTJsNDcyIn0.uAl7x2KeNK2OCFVGpspJGg").update {
        tileStoreUsageMode(TileStoreUsageMode.READ_ONLY)
      }
    }

    ViewManager {
      View { context ->
        MBXNavigationView(context)
      }
    }

  }

  val context: Context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }
}
