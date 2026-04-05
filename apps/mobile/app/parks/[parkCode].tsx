import { ScrollView, Text, View, Pressable } from 'react-native'
import * as React from 'react'

const STAMP_TYPE_LABELS: Record<string, string> = {
  visitorcenters: 'Visitor Center',
  parkoffices: 'Park Office',
  entrancestations: 'Entrance Station',
  flagpoles: 'Flagpole',
}

function formatStampType(type: string) {
  return STAMP_TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
}
import { useLocalSearchParams, Stack, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'
import type { NpsEvent, ThingToDo, VisitorCenter, PassportStampLocation, LessonPlan } from '@acme/api'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <View className="mt-6">
      <Pressable onPress={() => setOpen(o => !o)} className="flex-row items-center justify-between border-b border-gray-100 pb-2 mb-3">
        <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        <Text className="text-gray-400 text-base" style={{ transform: [{ rotate: open ? '0deg' : '-90deg' }] }}>
          ⌄
        </Text>
      </Pressable>
      {open && children}
    </View>
  )
}

export default function ParkDetailScreen() {
  const { parkCode } = useLocalSearchParams<{ parkCode: string }>()
  const trpc = useTRPC()

  const { data, isLoading, isError } = useQuery(
    trpc.parks.detail.queryOptions({ parkCode }),
  )

  const park = data?.park

  return (
    <>
      <Stack.Screen options={{ title: park?.fullName ?? 'Park Details' }} />

      {isLoading ? (
        <View className="flex-1 bg-white px-4 pt-6 space-y-3">
          {[80, 40, 120].map((h, i) => (
            <View key={i} style={{ height: h }} className="rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </View>
      ) : isError || !park ? (
        <View className="flex-1 bg-white px-4 pt-6">
          <Text className="text-red-500 text-sm">Could not load park details.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 pt-4 pb-10">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-900">{park.fullName}</Text>
          <Text className="text-xs text-gray-400 mt-1">
            {[park.designation, park.states].filter(Boolean).join(' · ')}
          </Text>
          {park.description ? (
            <Text className="mt-3 text-sm text-gray-700 leading-relaxed">{park.description}</Text>
          ) : null}
          {park.url ? (
            <Pressable onPress={() => Linking.openURL(park.url)} className="mt-2">
              <Text className="text-sm text-blue-600">Official website →</Text>
            </Pressable>
          ) : null}

          {/* Visitor Centers */}
          {data.visitorCenters.length > 0 && (
            <Section title="Visitor Centers">
              {data.visitorCenters.map((vc: VisitorCenter) => (
                <View key={vc.id} className="border border-gray-100 rounded-lg p-3 mb-2">
                  <Text className="font-medium text-gray-900">{vc.name}</Text>
                  {vc.description ? (
                    <Text className="text-sm text-gray-600 mt-1">{vc.description}</Text>
                  ) : null}
                  {vc.directionsInfo ? (
                    <Text className="text-sm text-gray-600 mt-1">
                      <Text className="font-medium">Directions: </Text>{vc.directionsInfo}
                    </Text>
                  ) : null}
                  {vc.operatingHours?.[0] ? (
                    <Text className="text-sm text-gray-600 mt-1">
                      <Text className="font-medium">Hours: </Text>{vc.operatingHours[0].description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Section>
          )}

          {/* Events */}
          {data.events.length > 0 && (
            <Section title="Upcoming Events">
              {data.events.map((ev: NpsEvent) => (
                <View key={ev.id} className="border border-gray-100 rounded-lg p-3 mb-2">
                  <Text className="font-medium text-gray-900">{ev.title}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {[ev.dateStart, ev.dateEnd].filter(Boolean).join(' – ')}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* Things To Do */}
          {data.thingsToDo.length > 0 && (
            <Section title="Things To Do">
              {data.thingsToDo.map((t: ThingToDo) => (
                <View key={t.id} className="border border-gray-100 rounded-lg p-3 mb-2">
                  <Text className="font-medium text-gray-900">{t.title}</Text>
                  {t.shortDescription ? (
                    <Text className="text-sm text-gray-600 mt-1">{t.shortDescription}</Text>
                  ) : null}
                  {t.season?.length > 0 ? (
                    <Text className="text-xs text-gray-400 mt-1">Season: {t.season.join(', ')}</Text>
                  ) : null}
                </View>
              ))}
            </Section>
          )}

          {/* Passport Stamp Locations */}
          {data.passportStampLocations.length > 0 && (
            <Section title="Passport Stamp Locations">
              {data.passportStampLocations.map((p: PassportStampLocation) => (
                <View key={p.id} className="border border-gray-100 rounded-lg p-3 mb-2">
                  <Text className="font-medium text-gray-900">{p.label}</Text>
                  {p.type ? (
                    <Text className="text-xs text-gray-400 mt-0.5">{formatStampType(p.type)}</Text>
                  ) : null}
                </View>
              ))}
            </Section>
          )}

          {/* Lesson Plans */}
          {data.lessonPlans.length > 0 && (
            <Section title="Lesson Plans">
              {data.lessonPlans.map((lp: LessonPlan) => (
                <View key={lp.id} className="border border-gray-100 rounded-lg p-3 mb-2">
                  <Text className="font-medium text-gray-900">{lp.title}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {[lp.gradeLevel, Array.isArray(lp.subject) ? lp.subject.join(', ') : lp.subject, lp.duration].filter(Boolean).join(' · ')}
                  </Text>
                  <Link href={`/parks/${parkCode}/lesson-plans/${lp.id}`} asChild>
                    <Pressable className="mt-1">
                      <Text className="text-sm text-blue-600">View lesson plan →</Text>
                    </Pressable>
                  </Link>
                </View>
              ))}
            </Section>
          )}

          {data.events.length === 0 && data.thingsToDo.length === 0 &&
           data.visitorCenters.length === 0 && data.passportStampLocations.length === 0 &&
           data.lessonPlans.length === 0 && (
            <Text className="mt-8 text-sm text-gray-400 text-center">
              No additional details available for this park.
            </Text>
          )}
        </ScrollView>
      )}
    </>
  )
}
