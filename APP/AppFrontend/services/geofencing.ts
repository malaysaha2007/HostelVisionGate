import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const GEOFENCE_TASK = "hostel-geofence-task";

import { GEOFENCE_CONFIG } from "../config/geofence";

// TEMPORARY TEST LOCATION
// This is your current room location.
const TEST_LATITUDE = 23.1767373;
const TEST_LONGITUDE = 80.0198892;

// Start with 50 meters for testing.
const TEST_RADIUS = 50;


// --------------------------------------------------
// BACKGROUND GEOFENCE TASK
// --------------------------------------------------

TaskManager.defineTask(
  GEOFENCE_TASK,
  async ({ data, error }) => {

    if (error) {
      console.log("GEOFENCE ERROR:", error);
      return;
    }

    if (!data) {
      console.log("No geofence data received");
      return;
    }

    const { eventType, region } = data as {
      eventType: Location.GeofencingEventType;
      region: Location.LocationRegion;
    };

    console.log("--------------------------------");
    console.log("GEOFENCE EVENT");

    if (
      eventType ===
      Location.GeofencingEventType.Enter
    ) {
      console.log("ENTERED GEOFENCE");
    }

    if (
      eventType ===
      Location.GeofencingEventType.Exit
    ) {
      console.log("EXITED GEOFENCE");
    }

    console.log("Region:", region);
    console.log("--------------------------------");
  }
);


// --------------------------------------------------
// START GEOFENCE
// --------------------------------------------------

export async function startHostelGeofence() {

  try {

    console.log("Starting hostel geofence...");


    // 1. FOREGROUND PERMISSION
    const foreground =
      await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== "granted") {

      console.log(
        "Foreground location permission denied"
      );

      return false;
    }


    // 2. BACKGROUND PERMISSION
    const background =
      await Location.requestBackgroundPermissionsAsync();

    if (background.status !== "granted") {

      console.log(
        "Background location permission denied"
      );

      return false;
    }


    // 3. START GEOFENCING

    await Location.startGeofencingAsync(
      GEOFENCE_TASK,
      [
        {
  identifier: "HOSTEL_GEOFENCE",

  latitude: GEOFENCE_CONFIG.latitude,

  longitude: GEOFENCE_CONFIG.longitude,

  radius: GEOFENCE_CONFIG.radius,

  notifyOnEnter: true,

  notifyOnExit: true,
},
      ]
    );


    console.log(
      "HOSTEL GEOFENCE STARTED"
    );

    console.log(
      "Center:",
      TEST_LATITUDE,
      TEST_LONGITUDE
    );

    console.log(
      "Radius:",
      TEST_RADIUS,
      "meters"
    );


    return true;

  } catch (error) {

    console.log(
      "START GEOFENCE ERROR:",
      error
    );

    return false;
  }
}


// --------------------------------------------------
// STOP GEOFENCE
// --------------------------------------------------

export async function stopHostelGeofence() {

  try {

    await Location.stopGeofencingAsync(
      GEOFENCE_TASK
    );

    console.log(
      "HOSTEL GEOFENCE STOPPED"
    );

    return true;

  } catch (error) {

    console.log(
      "STOP GEOFENCE ERROR:",
      error
    );

    return false;
  }
}