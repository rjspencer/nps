import { ScrollView, Text, View, Pressable } from 'react-native'
import * as React from 'react'
import { useLocalSearchParams, Stack, Link } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'
import { useTheme } from '@acme/ui-native'
import type { NpsEvent, ThingToDo, VisitorCenter, PassportStampLocation, LessonPlan } from '@acme/api'

const STAMP_TYPE_LABELS: Record<string, string> = {
  visitorcenters: 'Visitor Center',
  parkoffices: 'Park Office',
  entrancestations: 'Entrance Station',
  flagpoles: 'Flagpole',
}

function formatStampType(type: string) {
  return STAMP_TYPE_LABELS[type] ?? type.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof useTheme>['styles'] }) {
  const [open, setOpen] = React.useState(false)
  return (
    <View style={{ marginTop: 24 }}>
      <Pressable onPress={() => setOpen(o => !o)} style={[styles.borderBottom, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 12 }]}>
        <Text style={[styles.text, { fontSize: 17, fontWeight: '600' }]}>{title}</Text>
        <Text style={[styles.textMuted, { fontSize: 16 }]}>{open ? '⌄' : '›'}</Text>
      </Pressable>
      {open && children}
    </View>
  )
}

export default function ParkDetailScreen() {
  const { parkCode } = useLocalSearchParams<{ parkCode: string }>()
  const trpc = useTRPC()
  const { colors, styles } = useTheme()

  const { data, isLoading, isError } = useQuery(
    trpc.parks.detail.queryOptions({ parkCode }),
  )

  const park = data?.park

  return (
    <>
      <Stack.Screen options={{ title: park?.fullName ?? 'Park Details' }} />

      {isLoading ? (
        <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 24, gap: 12 }, styles.bg]}>
          {[80, 40, 120].map((h, i) => (
            <View key={i} style={[styles.muted, { height: h, borderRadius: 8 }]} />
          ))}
        </View>
      ) : isError || !park ? (
        <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }, styles.bg]}>
          <Text className="text-red-500 text-sm">Could not load park details.</Text>
        </View>
      ) : (
        <ScrollView style={[{ flex: 1 }, styles.bg]} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
          <Text style={[styles.text, { fontSize: 22, fontWeight: 'bold' }]}>{park.fullName}</Text>
          <Text style={[styles.textMuted, { fontSize: 12, marginTop: 4 }]}>
            {[park.designation, park.states].filter(Boolean).join(' · ')}
          </Text>
          {park.description ? (
            <Text style={[styles.text, { fontSize: 14, marginTop: 12, lineHeight: 20 }]}>{park.description}</Text>
          ) : null}

          {/* Visitor Centers */}
          {data.visitorCenters.length > 0 && (
            <Section title="Visitor Centers" styles={styles}>
              {data.visitorCenters.map((vc: VisitorCenter) => (
                <View key={vc.id} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{vc.name}</Text>
                  {vc.description ? <Text style={[styles.textMuted, { fontSize: 13, marginTop: 4 }]}>{vc.description}</Text> : null}
                  {vc.directionsInfo ? (
                    <Text style={[styles.textMuted, { fontSize: 13, marginTop: 4 }]}>
                      <Text style={{ fontWeight: '500' }}>Directions: </Text>{vc.directionsInfo}
                    </Text>
                  ) : null}
                  {vc.operatingHours?.[0] ? (
                    <Text style={[styles.textMuted, { fontSize: 13, marginTop: 4 }]}>
                      <Text style={{ fontWeight: '500' }}>Hours: </Text>{vc.operatingHours[0].description}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Section>
          )}

          {/* Events */}
          {data.events.length > 0 && (
            <Section title="Upcoming Events" styles={styles}>
              {data.events.map((ev: NpsEvent) => (
                <View key={ev.id} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{ev.title}</Text>
                  <Text style={[styles.textMuted, { fontSize: 12, marginTop: 2 }]}>
                    {[ev.dateStart, ev.dateEnd].filter(Boolean).join(' – ')}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </Text>
                </View>
              ))}
            </Section>
          )}

          {/* Things To Do */}
          {data.thingsToDo.length > 0 && (
            <Section title="Things To Do" styles={styles}>
              {data.thingsToDo.map((t: ThingToDo) => (
                <View key={t.id} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{t.title}</Text>
                  {t.shortDescription ? <Text style={[styles.textMuted, { fontSize: 13, marginTop: 4 }]}>{t.shortDescription}</Text> : null}
                  {t.season?.length > 0 ? <Text style={[styles.textMuted, { fontSize: 12, marginTop: 4 }]}>Season: {t.season.join(', ')}</Text> : null}
                </View>
              ))}
            </Section>
          )}

          {/* Passport Stamp Locations */}
          {data.passportStampLocations.length > 0 && (
            <Section title="Passport Stamp Locations" styles={styles}>
              {data.passportStampLocations.map((p: PassportStampLocation) => (
                <View key={p.id} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{p.label}</Text>
                  {p.type ? <Text style={[styles.textMuted, { fontSize: 12, marginTop: 2 }]}>{formatStampType(p.type)}</Text> : null}
                </View>
              ))}
            </Section>
          )}

          {/* Lesson Plans */}
          {data.lessonPlans.length > 0 && (
            <Section title="Lesson Plans" styles={styles}>
              {data.lessonPlans.map((lp: LessonPlan) => (
                <View key={lp.id} style={[styles.card, { padding: 12, marginBottom: 8 }]}>
                  <Text style={[styles.text, { fontWeight: '500' }]}>{lp.title}</Text>
                  <Text style={[styles.textMuted, { fontSize: 12, marginTop: 2 }]}>
                    {[lp.gradeLevel, Array.isArray(lp.subject) ? lp.subject.join(', ') : lp.subject, lp.duration].filter(Boolean).join(' · ')}
                  </Text>
                  <Link href={`/parks/${parkCode}/lesson-plans/${lp.id}`} asChild>
                    <Pressable style={{ marginTop: 4 }}>
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
            <Text style={[styles.textMuted, { marginTop: 32, textAlign: 'center', fontSize: 14 }]}>
              No additional details available for this park.
            </Text>
          )}
        </ScrollView>
      )}
    </>
  )
}
