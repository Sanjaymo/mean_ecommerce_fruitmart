import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth';
import { DeliveryLocation } from '../../models/interfaces';

@Component({
  selector: 'app-delivery-location',
  imports: [FormsModule, RouterLink],
  templateUrl: './delivery-location.html',
  styles: ``,
})
export class DeliveryLocationPage {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private map: any;
  private marker: any;
  private leaflet: any;
  private readonly defaultLat = 23.0225;
  private readonly defaultLng = 72.5714;
  private readonly geocodeTimeoutMs = 12000;

  @ViewChild('mapHost') mapHost?: ElementRef<HTMLDivElement>;

  lat = signal<number>(23.0225);
  lng = signal<number>(72.5714);
  addressLine = signal('');
  city = signal('');
  state = signal('');
  pincode = signal('');
  country = signal('India');
  formattedAddress = signal('');
  searchQuery = signal('');

  loading = signal(false);
  saving = signal(false);
  locationAccuracyMeters = signal<number | null>(null);
  msg = signal('');
  err = signal('');
  returnTo = signal('/dashboard');

  constructor() {

    const queryReturn = this.route.snapshot.queryParamMap.get('returnTo');
    if (queryReturn) this.returnTo.set(queryReturn);

    if (!isPlatformBrowser(this.platformId)) return;

    this.loading.set(true);
    this.api.getProfile().subscribe({
      next: user => {
        const loc = user.deliveryLocation as DeliveryLocation | undefined;
        if (loc) {
          this.lat.set(this.getSafeCoordinate(loc.lat, -90, 90, this.defaultLat));
          this.lng.set(this.getSafeCoordinate(loc.lng, -180, 180, this.defaultLng));
          this.addressLine.set(loc.addressLine || '');
          this.city.set(loc.city || '');
          this.state.set(loc.state || '');
          this.pincode.set(loc.pincode || '');
          this.country.set(loc.country || 'India');
          this.formattedAddress.set(loc.formattedAddress || '');
        }
        this.syncMarkerPosition();
        this.loading.set(false);
      },
      error: () => {
        this.err.set('Unable to load profile for delivery location');
        this.loading.set(false);
      },
    });
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId) || !this.mapHost) return;
    await this.initializeMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  private async initializeMap() {
    if (this.map || !this.mapHost) return;

    this.leaflet = await import('leaflet');
    const L = this.leaflet;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    const currentLat = this.getSafeCoordinate(this.lat(), -90, 90, this.defaultLat);
    const currentLng = this.getSafeCoordinate(this.lng(), -180, 180, this.defaultLng);
    this.lat.set(currentLat);
    this.lng.set(currentLng);

    this.map = L.map(this.mapHost.nativeElement, {
      zoomControl: true,
      attributionControl: true,
    }).setView([currentLat, currentLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(this.map);
    setTimeout(() => this.map?.invalidateSize(), 0);

    this.map.on('click', (e: any) => {
      this.setPin(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)), true);
    });

    this.marker.on('dragend', () => {
      const latlng = this.marker.getLatLng();
      this.setPin(Number(latlng.lat.toFixed(6)), Number(latlng.lng.toFixed(6)), true);
    });
  }

  private setPin(lat: number, lng: number, fetchAddress: boolean) {
    this.lat.set(lat);
    this.lng.set(lng);
    this.syncMarkerPosition();
    if (fetchAddress) this.reverseGeocode();
  }

  private syncMarkerPosition() {
    if (!this.map || !this.marker) return;
    const lat = this.getSafeCoordinate(this.lat(), -90, 90, this.defaultLat);
    const lng = this.getSafeCoordinate(this.lng(), -180, 180, this.defaultLng);
    this.lat.set(lat);
    this.lng.set(lng);
    this.marker.setLatLng([lat, lng]);
    this.map.panTo([lat, lng], { animate: true, duration: 0.3 });
  }

  private getSafeCoordinate(value: unknown, min: number, max: number, fallback: number): number {
    const parsed = typeof value === 'string' ? Number(value) : (value as number);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback;
    return Number(parsed.toFixed(6));
  }

  useCurrentLocation() {
    this.msg.set('');
    this.err.set('');
    this.locationAccuracyMeters.set(null);
    if (!isPlatformBrowser(this.platformId) || !navigator.geolocation) {
      this.err.set('Geolocation is not available in this browser');
      return;
    }

    this.loading.set(true);
    const options = {
      enableHighAccuracy: true,
      timeout: 25000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      firstPos => {
        const firstAccuracy = Number(firstPos.coords.accuracy || 0);

        const applyPosition = (pos: GeolocationPosition) => {
          const accuracy = Number(pos.coords.accuracy || 0);
          this.locationAccuracyMeters.set(Math.round(accuracy));

          if (!Number.isFinite(accuracy) || accuracy > 5000) {
            const roughLat = Number(pos.coords.latitude.toFixed(4));
            const roughLng = Number(pos.coords.longitude.toFixed(4));
            this.fetchJsonWithTimeout(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${roughLat}&longitude=${roughLng}&localityLanguage=en`,
              8000
            ).then(data => {
              const city = data?.city || data?.locality || '';
              const state = data?.principalSubdivision || '';
              if (city) {
                const hint = [city, state].filter(Boolean).join(', ');
                this.searchQuery.set(hint);
                this.err.set(`GPS accuracy too low (${Math.round(accuracy)} m). We detected you're near "${hint}" — confirm your exact spot using Search.`);
              } else {
                this.err.set(`GPS accuracy too low (${Math.round(accuracy)} m). Please enable precise location/GPS or search manually.`);
              }
            }).catch(() => {
              this.err.set(`GPS accuracy too low (${Math.round(accuracy)} m). Please enable precise location/GPS or search manually.`);
            }).finally(() => {
              this.loading.set(false);
            });
            return;
          }

          this.setPin(Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6)), true);
        };

        if (firstAccuracy > 1200) {
          navigator.geolocation.getCurrentPosition(
            secondPos => {
              const secondAccuracy = Number(secondPos.coords.accuracy || 0);
              applyPosition(secondAccuracy <= firstAccuracy ? secondPos : firstPos);
            },
            () => applyPosition(firstPos),
            options
          );
          return;
        }

        applyPosition(firstPos);
      },
      error => {
        if (error.code === error.PERMISSION_DENIED) {
          this.err.set('Location access denied. Please allow location permission and try again.');
        } else if (error.code === error.TIMEOUT) {
          this.err.set('Location request timed out. Please check GPS/network and try again.');
        } else {
          this.err.set('Unable to detect precise current location. Please try again after enabling high accuracy location.');
        }
        this.loading.set(false);
      },
      options
    );
  }

  fetchMyLocation() {
    this.useCurrentLocation();
  }

  async reverseGeocode() {
    this.msg.set('');
    this.err.set('');
    this.loading.set(true);

    const lat = this.lat();
    const lng = this.lng();

    try {
      const nominatimData = await this.fetchJsonWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        this.geocodeTimeoutMs
      );

      if (nominatimData && nominatimData.address) {
        const address = nominatimData.address || {};
        this.addressLine.set(address.house_number ? `${address.house_number} ${address.road || ''}`.trim() : (address.road || this.addressLine()));
        this.city.set(address.city || address.town || address.village || this.city());
        this.state.set(address.state || this.state());
        this.pincode.set(address.postcode || this.pincode());
        this.country.set(address.country || this.country());
        this.formattedAddress.set(nominatimData.display_name || this.formattedAddress());
        this.syncMarkerPosition();
        return;
      }

      throw new Error('Primary reverse geocode did not return address details');
    } catch {
      try {
        const fallbackData = await this.fetchJsonWithTimeout(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          this.geocodeTimeoutMs
        );

        this.addressLine.set(fallbackData?.locality || fallbackData?.principalSubdivision || this.addressLine());
        this.city.set(fallbackData?.city || fallbackData?.locality || this.city());
        this.state.set(fallbackData?.principalSubdivision || this.state());
        this.pincode.set(fallbackData?.postcode || this.pincode());
        this.country.set(fallbackData?.countryName || this.country());
        this.formattedAddress.set(fallbackData?.localityInfo?.administrative?.map((part: any) => part.name).join(', ') || this.formattedAddress());
        this.syncMarkerPosition();
      } catch {
        this.err.set('Could not fetch address from selected pin. Please move the pin and try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async searchLocation() {
    this.msg.set('');
    this.err.set('');

    const query = this.searchQuery().trim();
    if (!query) {
      this.err.set('Please type a location to search.');
      return;
    }

    this.loading.set(true);

    try {
      const results = await this.fetchJsonWithTimeout(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        this.geocodeTimeoutMs
      );

      if (!Array.isArray(results) || !results.length) {
        this.err.set('No location found for the entered search text.');
        return;
      }

      const result = results[0] || {};
      const lat = this.getSafeCoordinate(result.lat, -90, 90, this.defaultLat);
      const lng = this.getSafeCoordinate(result.lon, -180, 180, this.defaultLng);
      const address = result.address || {};

      this.setPin(lat, lng, false);
      this.addressLine.set(address.house_number ? `${address.house_number} ${address.road || ''}`.trim() : (address.road || result.name || this.addressLine()));
      this.city.set(address.city || address.town || address.village || this.city());
      this.state.set(address.state || this.state());
      this.pincode.set(address.postcode || this.pincode());
      this.country.set(address.country || this.country());
      this.formattedAddress.set(result.display_name || this.formattedAddress());
      this.msg.set('Location found and pin updated.');
    } catch {
      this.err.set('Unable to search location right now. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private async fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Geocode request failed with status ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  saveLocation() {
    this.msg.set('');
    this.err.set('');

    const lat = this.getSafeCoordinate(this.lat(), -90, 90, this.defaultLat);
    const lng = this.getSafeCoordinate(this.lng(), -180, 180, this.defaultLng);
    this.lat.set(lat);
    this.lng.set(lng);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      this.err.set('Latitude must be between -90 and 90');
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      this.err.set('Longitude must be between -180 and 180');
      return;
    }

    const location: DeliveryLocation = {
      lat,
      lng,
      addressLine: this.addressLine().trim(),
      city: this.city().trim(),
      state: this.state().trim(),
      pincode: this.pincode().trim(),
      country: this.country().trim() || 'India',
      formattedAddress: this.formattedAddress().trim() || `${this.addressLine()}, ${this.city()}, ${this.state()}, ${this.pincode()}, ${this.country()}`,
      updatedAt: new Date().toISOString(),
    };

    this.saving.set(true);
    this.api.updateProfile({ deliveryLocation: location }).subscribe({
      next: user => {
        this.auth.updateUser(user);
        this.msg.set('Delivery location saved successfully');
        this.saving.set(false);
      },
      error: () => {
        this.err.set('Failed to save delivery location');
        this.saving.set(false);
      },
    });
  }

  continueBack() {
    this.router.navigateByUrl(this.returnTo());
  }
}
