/**
 * Device Motion Sensor & GPS Geolocation Tracking for Shinobi Step Counter
 */

export interface StepCounterCallbacks {
  onStep: (newStepCount: number, addedStep: number) => void;
  onDistanceUpdate?: (totalDistanceKm: number) => void;
  onError?: (errMessage: string) => void;
}

export class PedometerSensorManager {
  private isListening = false;
  private lastStepTimestamp = 0;
  private lastAccelMag = 9.8;
  private threshold = 11.2; // Acceleration threshold for step detection
  private stepCount = 0;
  private callbacks: StepCounterCallbacks | null = null;
  private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;

  constructor(initialSteps: number = 0) {
    this.stepCount = initialSteps;
  }

  setStepCount(count: number) {
    this.stepCount = count;
  }

  async startListening(callbacks: StepCounterCallbacks): Promise<{ supported: boolean; permissionGranted: boolean }> {
    this.callbacks = callbacks;

    if (typeof window === 'undefined') {
      return { supported: false, permissionGranted: false };
    }

    if (!('DeviceMotionEvent' in window)) {
      callbacks.onError?.('Device motion sensors not supported on this device/browser');
      return { supported: false, permissionGranted: false };
    }

    // Check iOS permission requirement
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          callbacks.onError?.('Permission to access device motion sensors was denied');
          return { supported: true, permissionGranted: false };
        }
      } catch (err: any) {
        callbacks.onError?.(err?.message || 'Error requesting sensor permissions');
        return { supported: true, permissionGranted: false };
      }
    }

    this.motionHandler = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity || event.acceleration;
      if (!accel) return;

      const x = accel.x || 0;
      const y = accel.y || 0;
      const z = accel.z || 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      // Peak detection with minimum 280ms gap between footsteps (max ~3.5 steps/sec for fast run)
      if (magnitude > this.threshold && this.lastAccelMag <= this.threshold) {
        if (now - this.lastStepTimestamp > 280) {
          this.lastStepTimestamp = now;
          this.stepCount += 1;
          this.callbacks?.onStep(this.stepCount, 1);
        }
      }
      this.lastAccelMag = magnitude;
    };

    window.addEventListener('devicemotion', this.motionHandler, true);
    this.isListening = true;
    return { supported: true, permissionGranted: true };
  }

  stopListening() {
    if (this.isListening && this.motionHandler) {
      window.removeEventListener('devicemotion', this.motionHandler, true);
      this.motionHandler = null;
      this.isListening = false;
    }
  }

  getIsActive() {
    return this.isListening;
  }
}

// GPS Distance Tracker using Haversine formula
export class GpsActivityTracker {
  private watchId: number | null = null;
  private lastPosition: { lat: number; lng: number } | null = null;
  private totalDistanceMeters = 0;
  private onDistanceChange: ((distanceKm: number, currentSpeedMps: number | null) => void) | null = null;
  private onError: ((err: string) => void) | null = null;

  startTracking(
    onDistanceChange: (distanceKm: number, currentSpeedMps: number | null) => void,
    onError?: (err: string) => void
  ) {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      onError?.('Geolocation is not supported by your browser.');
      return;
    }

    this.onDistanceChange = onDistanceChange;
    this.onError = onError || null;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        if (this.lastPosition) {
          const deltaMeters = this.calculateDistance(
            this.lastPosition.lat,
            this.lastPosition.lng,
            latitude,
            longitude
          );

          // Filter out GPS drift (only count movements between 1.5m and 100m between updates)
          if (deltaMeters > 1.5 && deltaMeters < 150) {
            this.totalDistanceMeters += deltaMeters;
            const distanceKm = Number((this.totalDistanceMeters / 1000).toFixed(2));
            this.onDistanceChange?.(distanceKm, speed);
          }
        }
        this.lastPosition = { lat: latitude, lng: longitude };
      },
      (error) => {
        this.onError?.(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.lastPosition = null;
    }
  }

  reset() {
    this.totalDistanceMeters = 0;
    this.lastPosition = null;
  }

  // Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
