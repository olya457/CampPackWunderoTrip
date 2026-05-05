import React, {useMemo, useState} from 'react';
import {
  ImageBackground,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {assets} from '../assets';
import {Card, Chip, EmptyState, Header, IconButton, Page, PrimaryButton, SegmentedControl} from '../components/ui';
import {locations} from '../data/content';
import {colors} from '../theme/colors';
import type {Location} from '../types/models';

type LocationsScreenProps = {
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
};

export const LocationsScreen = ({savedIds, onToggleSave, onOpen}: LocationsScreenProps) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'explore' | 'saved'>('explore');

  const visibleLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return locations.filter(location => {
      const savedMatch = mode === 'explore' || savedIds.includes(location.id);
      const searchMatch =
        !normalized ||
        `${location.title} ${location.city} ${location.country} ${location.type}`
          .toLowerCase()
          .includes(normalized);
      return savedMatch && searchMatch;
    });
  }, [mode, query, savedIds]);

  return (
    <Page withTabs>
      <Header eyebrow="Your Trip" title="Camp Locations" />
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search locations..."
          placeholderTextColor="#7e9bbb"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          {key: 'explore', label: 'Explore'},
          {key: 'saved', label: `Saved (${savedIds.length})`},
        ]}
      />
      <View style={styles.list}>
        {visibleLocations.length === 0 ? (
          <EmptyState title="No locations found" subtitle="Save a location to see it here" />
        ) : (
          visibleLocations.map(location => (
            <LocationCard
              key={location.id}
              location={location}
              saved={savedIds.includes(location.id)}
              onToggleSave={() => onToggleSave(location.id)}
              onOpen={() => onOpen(location.id)}
            />
          ))
        )}
      </View>
    </Page>
  );
};

type LocationCardProps = {
  location: Location;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
};

const LocationCard = ({location, saved, onToggleSave, onOpen}: LocationCardProps) => (
  <Pressable accessibilityRole="button" onPress={onOpen} style={({pressed}) => [pressed && styles.pressed]}>
    <Card style={styles.locationCard}>
      <ImageBackground
        source={assets.locations[location.image]}
        style={styles.locationImage}
        imageStyle={styles.locationImageRadius}>
        <View style={styles.locationShade} />
        <View style={styles.saveRow}>
          <IconButton
            label={saved ? '🔖' : '🤍'}
            active={saved}
            onPress={onToggleSave}
            size={42}
          />
        </View>
        <View style={styles.locationCopy}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {location.title}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            📍 {location.city}, {location.country}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.cardFooter}>
        <Chip label={location.type} tone="cyan" />
        <Chip label={location.difficulty} tone={location.difficulty === 'Easy' ? 'green' : 'red'} />
      </View>
    </Card>
  </Pressable>
);

type LocationDetailProps = {
  locationId: string;
  saved: boolean;
  onBack: () => void;
  onToggleSave: (id: string) => void;
};

export const LocationDetailScreen = ({
  locationId,
  saved,
  onBack,
  onToggleSave,
}: LocationDetailProps) => {
  const location = locations.find(item => item.id === locationId) ?? locations[0];
  const {height} = useWindowDimensions();
  const heroHeight = Math.max(280, Math.min(390, height * 0.38));
  const region = {
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
    latitudeDelta: 0.24,
    longitudeDelta: 0.24,
  };

  const shareLocation = () => {
    Share.share({
      title: location.title,
      message: `${location.title} in ${location.city}, ${location.country}. Coordinates: ${location.coordinates.latitude}, ${location.coordinates.longitude}`,
    }).catch(() => undefined);
  };

  return (
    <Page scroll contentStyle={styles.detailPage}>
      <ImageBackground
        source={assets.locations[location.image]}
        resizeMode="cover"
        style={[styles.hero, {height: heroHeight}]}
        imageStyle={styles.heroImage}>
        <View style={styles.heroShade} />
        <View style={styles.heroTop}>
          <IconButton label="⬅️" onPress={onBack} />
          <View style={styles.heroActions}>
            <IconButton label={saved ? '🔖' : '🤍'} active={saved} onPress={() => onToggleSave(location.id)} />
            <IconButton label="📤" onPress={shareLocation} />
          </View>
        </View>
        <View style={styles.heroCopy}>
          <View style={styles.tagRow}>
            <Chip label={location.type} tone="cyan" />
            <Chip label={location.difficulty} tone={location.difficulty === 'Easy' ? 'green' : 'red'} />
          </View>
          <Text style={styles.detailTitle}>{location.title}</Text>
        </View>
      </ImageBackground>
      <View style={styles.detailBody}>
        <Text style={styles.detailMeta}>📍 {location.city}, {location.country}</Text>
        <Card style={styles.aboutCard}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.aboutText}>{location.description}</Text>
        </Card>
        <Card style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.sectionLabel}>LOCATION MAP</Text>
            <Text style={styles.coordText}>
              {location.coordinates.latitude.toFixed(2)}°, {location.coordinates.longitude.toFixed(2)}°
            </Text>
          </View>
          <MapView
            style={styles.map}
            initialRegion={region}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}>
            <Marker coordinate={location.coordinates} title={location.title} />
          </MapView>
        </Card>
        <View style={styles.statsPanel}>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>{location.type}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={[styles.statValue, location.difficulty !== 'Easy' && styles.hardValue]}>
              {location.difficulty}
            </Text>
          </View>
        </View>
        <PrimaryButton label="Share This Location" icon="📤" onPress={shareLocation} />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: colors.muted,
    fontSize: 22,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  list: {
    gap: 16,
    marginTop: 20,
  },
  locationCard: {
    overflow: 'hidden',
  },
  locationImage: {
    height: 184,
    justifyContent: 'space-between',
    padding: 14,
  },
  locationImageRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  locationShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 10, 18, 0.28)',
  },
  saveRow: {
    alignItems: 'flex-end',
  },
  locationCopy: {
    marginTop: 'auto',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  pressed: {
    opacity: 0.82,
  },
  detailPage: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  hero: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroImage: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 10, 18, 0.38)',
  },
  heroTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroCopy: {
    paddingBottom: 22,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
  detailBody: {
    gap: 20,
    padding: 20,
  },
  detailMeta: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  aboutCard: {
    padding: 18,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  aboutText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 25,
  },
  mapCard: {
    overflow: 'hidden',
  },
  mapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  coordText: {
    color: colors.faint,
    fontSize: 12,
    fontWeight: '700',
  },
  map: {
    height: 190,
    width: '100%',
  },
  statsPanel: {
    backgroundColor: 'rgba(13, 34, 57, 0.56)',
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  statInfo: {
    flex: 1,
    gap: 6,
  },
  statValue: {
    color: colors.cyan,
    fontSize: 17,
    fontWeight: '900',
  },
  hardValue: {
    color: colors.red,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statDivider: {
    backgroundColor: colors.borderSoft,
    marginHorizontal: 18,
    width: 1,
  },
});
