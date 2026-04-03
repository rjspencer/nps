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
import { useState, useEffect, useCallback } from 'react'
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

const LIMIT = 20

export default function HomeScreen() {
  const trpc = useTRPC()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [statePickerVisible, setStatePickerVisible] = useState(false)
  const [designation, setDesignation] = useState('')
  const [designationPickerVisible, setDesignationPickerVisible] = useState(false)
  const [sortAsc, setSortAsc] = useState(true)
  const [start, setStart] = useState(0)
  const [allParks, setAllParks] = useState<Park[]>([])

  const sort = sortAsc ? 'fullName' as const : '-fullName' as const

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q)
      setStart(0)
      setAllParks([])
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  // Reset on filter/sort change
  useEffect(() => {
    setStart(0)
    setAllParks([])
  }, [stateCode, designation, sort])

  const { data: designationData } = useQuery(trpc.parks.designations.queryOptions())

  const { data, isLoading, isError } = useQuery(
    trpc.parks.list.queryOptions({
      q: debouncedQ || undefined,
      stateCode: stateCode || undefined,
      designation: designation || undefined,
      sort,
      limit: LIMIT,
      start,
    }),
  )

  // Accumulate pages
  useEffect(() => {
    if (data?.data) {
      if (start === 0) {
        setAllParks(data.data)
      } else {
        setAllParks((prev) => [...prev, ...data.data])
      }
    }
  }, [data, start])

  const total = data?.total ?? 0
  const hasMore = start + LIMIT < total
  const selectedStateName = US_STATES.find((s) => s.code === stateCode)?.name

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) setStart((s) => s + LIMIT)
  }, [isLoading, hasMore])

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
            onPress={() => { setSortAsc((v) => !v); setStart(0); setAllParks([]) }}
            className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 justify-center"
          >
            <Text className="text-sm text-gray-700">{sortAsc ? 'A–Z' : 'Z–A'}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400">
          {isLoading && allParks.length === 0
            ? 'Loading…'
            : isError
            ? 'Could not load parks.'
            : total === 0
            ? 'No parks found.'
            : `${total} parks`}
        </Text>
      </View>

      {/* List */}
      {isLoading && allParks.length === 0 ? (
        <ActivityIndicator className="mt-12" size="large" color="#374151" />
      ) : isError && allParks.length === 0 ? (
        <Text className="mt-12 text-center text-sm text-red-500">
          Failed to load parks. Check your connection.
        </Text>
      ) : (
        <FlatList
          data={allParks}
          keyExtractor={(item) => item.id}
          renderItem={renderPark}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoading && allParks.length > 0
              ? () => <ActivityIndicator className="py-4" color="#374151" />
              : hasMore
              ? () => (
                  <TouchableOpacity onPress={handleLoadMore} className="py-4 items-center">
                    <Text className="text-sm text-gray-500">Load more</Text>
                  </TouchableOpacity>
                )
              : null
          }
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
            data={['', ...(designationData ?? [])]}
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
