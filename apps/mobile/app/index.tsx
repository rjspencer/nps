import {
  ActivityIndicator,
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
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'
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

export default function HomeScreen() {
  const trpc = useTRPC()
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

  const { data: allParks = [], isLoading, isError } = useQuery({
    ...trpc.parks.list.queryOptions(),
    staleTime: 1000 * 60 * 60 * 24,
  })

  const designations = useMemo(
    () => [...new Set(allParks.map((p: Park) => p.designation).filter(Boolean))].sort() as string[],
    [allParks],
  )

  const parks = useMemo(() => {
    let result = allParks as Park[]
    if (debouncedQ) result = result.filter((p) => p.fullName.toLowerCase().includes(debouncedQ.toLowerCase()))
    if (stateCode) result = result.filter((p) => p.states.split(',').map((s) => s.trim()).includes(stateCode))
    if (designation) result = result.filter((p) => p.designation === designation)
    return [...result].sort((a, b) =>
      sortAsc ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName),
    )
  }, [allParks, debouncedQ, stateCode, designation, sortAsc])

  const selectedStateName = US_STATES.find((s) => s.code === stateCode)?.name

  const renderPark = useCallback(({ item }: { item: Park }) => (
    <Link href={`/parks/${item.parkCode}`} asChild>
      <Pressable className="border-b border-gray-100 px-4 py-3 active:bg-gray-50">
        <Text className="font-semibold text-gray-900" numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {[item.designation, item.states].filter(Boolean).join(' · ')}
        </Text>
        {!!item.description && (
          <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </Pressable>
    </Link>
  ), [])

  return (
    <View className="flex-1 bg-white">
      {/* Controls */}
      <View className="px-4 pt-3 pb-2 gap-2 border-b border-gray-100">
        <TextInput
          placeholder="Search by name..."
          value={q}
          onChangeText={setQ}
          clearButtonMode="while-editing"
          className="h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900"
          placeholderTextColor="#9ca3af"
        />

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setStatePickerVisible(true)}
            className="flex-1 h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 justify-center"
          >
            <Text className="text-sm text-gray-700" numberOfLines={1}>
              {selectedStateName ?? 'All states'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDesignationPickerVisible(true)}
            className="flex-1 h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 justify-center"
          >
            <Text className="text-sm text-gray-700" numberOfLines={1}>
              {designation || 'All types'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSortAsc((v) => !v)}
            className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 justify-center"
          >
            <Text className="text-sm text-gray-700">{sortAsc ? 'A–Z' : 'Z–A'}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400">
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
        <ActivityIndicator className="mt-12" size="large" color="#374151" />
      ) : isError ? (
        <Text className="mt-12 text-center text-sm text-red-500">
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
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">Select a type</Text>
            <Pressable onPress={() => setDesignationPickerVisible(false)}>
              <Text className="text-sm text-blue-600">Done</Text>
            </Pressable>
          </View>

          <FlatList
            data={['', ...designations]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setDesignation(item); setDesignationPickerVisible(false) }}
                className="px-4 py-3 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-sm text-gray-900">{item || 'All types'}</Text>
                {designation === item && (
                  <Text className="text-blue-600 text-sm">✓</Text>
                )}
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
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">Select a state</Text>
            <Pressable onPress={() => setStatePickerVisible(false)}>
              <Text className="text-sm text-blue-600">Done</Text>
            </Pressable>
          </View>

          <FlatList
            data={[{ code: '', name: 'All states' }, ...US_STATES]}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setStateCode(item.code); setStatePickerVisible(false) }}
                className="px-4 py-3 border-b border-gray-50 flex-row items-center justify-between"
              >
                <Text className="text-sm text-gray-900">{item.name}</Text>
                {stateCode === item.code && (
                  <Text className="text-blue-600 text-sm">✓</Text>
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  )
}
