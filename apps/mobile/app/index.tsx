import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'
import { useTheme } from '@acme/ui-native'
import type { Park } from '@acme/api'

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' }, { code: 'PR', name: 'Puerto Rico' },
  { code: 'VI', name: 'U.S. Virgin Islands' }, { code: 'GU', name: 'Guam' },
  { code: 'AS', name: 'American Samoa' }, { code: 'MP', name: 'Northern Mariana Islands' },
]

const DESIGNATION_GROUPS: { label: string; values: string[] }[] = [
  {
    label: 'National Battlefields & Military Parks',
    values: ['National Battlefield', 'National Battlefield Park', 'National Battlefield Site', 'National Military Park'],
  },
  {
    label: 'National Historical Parks',
    values: ['National Historical Park', 'National Historical Park and Ecological Preserve', 'National Historical Park and Preserve', 'National Historical Reserve', 'Part of Colonial National Historical Park'],
  },
  {
    label: 'National Historic Sites',
    values: ['National Historic Site', 'National Historic Area'],
  },
  {
    label: 'International Parks & Historic Sites',
    values: ['International Park', 'International Historic Site'],
  },
  {
    label: 'National Memorials',
    values: ['Memorial', 'National Memorial'],
  },
  {
    label: 'National Monuments',
    values: ['National Monument', 'National Monument & Preserve', 'National Monument and Historic Shrine', 'Part of Statue of Liberty National Monument'],
  },
  {
    label: 'National Parks',
    values: ['National Park', 'National Park & Preserve', 'National Parks', 'National and State Parks'],
  },
  {
    label: 'National Preserves & Reserves',
    values: ['National Preserve', 'National Reserve', 'Ecological & Historic Preserve'],
  },
  {
    label: 'National Rivers & Scenic Rivers',
    values: ['National River', 'National River & Recreation Area', 'National Recreational River', 'National Scenic River', 'National Scenic Riverway', 'National Scenic Riverways', 'National Wild and Scenic River', 'Scenic & Recreational River', 'Wild & Scenic River', 'Wild River'],
  },
  {
    label: 'National Trails',
    values: ['National Geologic Trail', 'National Historic Trail', 'National Scenic Trail'],
  },
  {
    label: 'Parks',
    values: ['Park'],
  },
  {
    label: 'Parkways',
    values: ['Memorial Parkway', 'Parkway'],
  },
]

const DESIGNATION_TO_GROUP = new Map<string, string>()
for (const group of DESIGNATION_GROUPS) {
  for (const v of group.values) DESIGNATION_TO_GROUP.set(v, group.label)
}

export default function HomeScreen() {
  const trpc = useTRPC()
  const { colors, styles } = useTheme()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [statePickerVisible, setStatePickerVisible] = useState(false)
  const [designation, setDesignation] = useState('')
  const [designationPickerVisible, setDesignationPickerVisible] = useState(false)
  const [sortAsc, setSortAsc] = useState(true)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const PAGE_STARTS = [0, 150, 300, 450]
  const PAGE_SIZE = 150
  const ONE_DAY = 1000 * 60 * 60 * 24

  const results = useQueries({
    queries: PAGE_STARTS.map((pageStart) => ({
      ...trpc.parks.list.queryOptions({ start: pageStart, limit: PAGE_SIZE }),
      staleTime: ONE_DAY,
    })),
  })

  const allParks: Park[] = results.flatMap((r) => r.data ?? [])
  const isLoading = allParks.length === 0 && results.some((r) => r.isLoading)
  const isError = allParks.length === 0 && results.every((r) => r.isError)

  const designationOptions = useMemo(() => {
    const labels = new Set(
      allParks.map((p) => DESIGNATION_TO_GROUP.get(p.designation) ?? p.designation).filter(Boolean)
    )
    return [...labels].sort() as string[]
  }, [allParks])

  const parks = useMemo(() => {
    let result = allParks
    if (debouncedQ) result = result.filter((p) => p.fullName.toLowerCase().includes(debouncedQ.toLowerCase()))
    if (stateCode) result = result.filter((p) => p.states.split(',').map((s) => s.trim()).includes(stateCode))
    if (designation) {
      const group = DESIGNATION_GROUPS.find((g) => g.label === designation)
      result = group
        ? result.filter((p) => group.values.includes(p.designation))
        : result.filter((p) => p.designation === designation)
    }
    return [...result].sort((a, b) =>
      sortAsc ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName),
    )
  }, [allParks, debouncedQ, stateCode, designation, sortAsc])

  const selectedStateName = US_STATES.find((s) => s.code === stateCode)?.name

  const renderPark = useCallback(({ item }: { item: Park }) => (
    <Link href={`/parks/${item.parkCode}`} asChild>
      <Pressable style={{ ...styles.divider, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ color: styles.text, fontWeight: '600', fontSize: 15 }} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={{ color: styles.textMuted, fontSize: 12, marginTop: 2 }}>
          {[item.designation, item.states].filter(Boolean).join(' · ')}
        </Text>
        {!!item.description && (
          <Text style={{ color: styles.textMuted, fontSize: 14, marginTop: 4 }} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </Pressable>
    </Link>
  ), [styles])

  return (
    <View style={{ flex: 1, backgroundColor: styles.bg }}>
      {/* Controls */}
      <View style={{ ...styles.divider, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 }}>
        <TextInput
          placeholder="Search by name..."
          value={q}
          onChangeText={setQ}
          clearButtonMode="while-editing"
          style={{ ...styles.inputBase }}
          placeholderTextColor={colors.mutedForeground}
        />

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setStatePickerVisible(true)}
            style={{ ...styles.pillBase, flex: 1 }}
          >
            <Text style={{ color: styles.text, fontSize: 14 }} numberOfLines={1}>
              {selectedStateName ?? 'All states'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDesignationPickerVisible(true)}
            style={{ ...styles.pillBase, flex: 1 }}
          >
            <Text style={{ color: styles.text, fontSize: 14 }} numberOfLines={1}>
              {designation || 'All types'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortAsc((v) => !v)}
            style={styles.pillBase}
          >
            <Text style={{ color: styles.text, fontSize: 14 }}>{sortAsc ? 'A–Z' : 'Z–A'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: styles.textMuted, fontSize: 12 }}>
          {isLoading
            ? 'Loading…'
            : isError
            ? 'Could not load parks.'
            : parks.length === 0
            ? 'No parks found.'
            : `${parks.length} parks`}
        </Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={{ ...styles.divider, paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
              <View style={{ backgroundColor: styles.muted, height: 16, width: '66%', borderRadius: 4 }} />
              <View style={{ backgroundColor: styles.muted, height: 12, width: '33%', borderRadius: 4 }} />
              <View style={{ backgroundColor: styles.muted, height: 12, width: '100%', borderRadius: 4 }} />
            </View>
          ))}
        </View>
      ) : isError ? (
        <Text style={{ marginTop: 48, textAlign: 'center', fontSize: 14, color: '#ef4444' }}>
          Failed to load parks. Check your connection.
        </Text>
      ) : (
        <FlatList
          data={parks}
          keyExtractor={(item) => item.id}
          renderItem={renderPark}
        />
      )}

      {/* Designation picker modal */}
      <Modal
        visible={designationPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDesignationPickerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: styles.bg }}>
          <View style={{ ...styles.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: styles.text, fontSize: 16, fontWeight: '600' }}>Select a type</Text>
            <Pressable onPress={() => setDesignationPickerVisible(false)}>
              <Text style={{ color: colors.ring, fontSize: 14 }}>Done</Text>
            </Pressable>
          </View>

          <FlatList
            data={['', ...designationOptions]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setDesignation(item); setDesignationPickerVisible(false) }}
                style={{ ...styles.divider, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Text style={{ color: styles.text, fontSize: 14 }}>{item || 'All types'}</Text>
                {designation === item && <Text style={{ color: colors.ring, fontSize: 14 }}>✓</Text>}
              </Pressable>
            )}
          />
        </View>
      </Modal>

      {/* State picker modal */}
      <Modal
        visible={statePickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setStatePickerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: styles.bg }}>
          <View style={{ ...styles.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: styles.text, fontSize: 16, fontWeight: '600' }}>Select a state</Text>
            <Pressable onPress={() => setStatePickerVisible(false)}>
              <Text style={{ color: colors.ring, fontSize: 14 }}>Done</Text>
            </Pressable>
          </View>

          <FlatList
            data={[{ code: '', name: 'All states' }, ...US_STATES]}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setStateCode(item.code); setStatePickerVisible(false) }}
                style={{ ...styles.divider, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Text style={{ color: styles.text, fontSize: 14 }}>{item.name}</Text>
                {stateCode === item.code && <Text style={{ color: colors.ring, fontSize: 14 }}>✓</Text>}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  )
}
