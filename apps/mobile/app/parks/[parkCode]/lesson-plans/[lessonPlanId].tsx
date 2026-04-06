import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'
import { useTheme } from '@acme/ui-native'

export default function LessonPlanDetailScreen() {
  const { lessonPlanId } = useLocalSearchParams<{ parkCode: string; lessonPlanId: string }>()
  const trpc = useTRPC()
  const { styles } = useTheme()

  const { data: lp, isLoading, isError } = useQuery(
    trpc.parks.lessonPlanDetail.queryOptions({ id: lessonPlanId }),
  )

  const subjects = lp ? (Array.isArray(lp.subject) ? lp.subject : [lp.subject].filter(Boolean)) : []
  const meta = lp ? [lp.gradeLevel, subjects.join(', '), lp.duration].filter(Boolean).join(' · ') : ''

  const hasStandards = lp && (
    lp.commonCore?.stateStandards ||
    lp.commonCore?.additionalStandards ||
    (lp.commonCore?.mathStandards?.length ?? 0) > 0 ||
    (lp.commonCore?.elaStandards?.length ?? 0) > 0
  )

  return (
    <>
      <Stack.Screen options={{ title: lp?.title ?? 'Lesson Plan' }} />

      {isLoading ? (
        <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 24, gap: 12 }, styles.bg]}>
          {[40, 24, 100].map((h, i) => (
            <View key={i} style={[styles.muted, { height: h, borderRadius: 8 }]} />
          ))}
        </View>
      ) : isError || !lp ? (
        <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 24 }, styles.bg]}>
          <Text className="text-red-500 text-sm">Could not load lesson plan.</Text>
        </View>
      ) : (
        <ScrollView style={[{ flex: 1 }, styles.bg]} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
          <Text style={[styles.text, { fontSize: 22, fontWeight: 'bold' }]}>{lp.title}</Text>
          {meta ? <Text style={[styles.textMuted, { fontSize: 12, marginTop: 4 }]}>{meta}</Text> : null}

          {lp.questionObjective ? (
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.text, styles.borderBottom, { fontSize: 17, fontWeight: '600', paddingBottom: 8, marginBottom: 12 }]}>
                Learning Objectives
              </Text>
              <Text style={[styles.text, { fontSize: 14, lineHeight: 22 }]}>{lp.questionObjective}</Text>
            </View>
          ) : null}

          {hasStandards ? (
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.text, styles.borderBottom, { fontSize: 17, fontWeight: '600', paddingBottom: 8, marginBottom: 12 }]}>
                Educational Standards
              </Text>

              {lp.commonCore.stateStandards ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.text, { fontSize: 14, fontWeight: '500', marginBottom: 4 }]}>State Standards</Text>
                  <Text style={[styles.textMuted, { fontSize: 14 }]}>{lp.commonCore.stateStandards}</Text>
                </View>
              ) : null}

              {lp.commonCore.additionalStandards ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.text, { fontSize: 14, fontWeight: '500', marginBottom: 4 }]}>Additional Standards</Text>
                  <Text style={[styles.textMuted, { fontSize: 14 }]}>{lp.commonCore.additionalStandards}</Text>
                </View>
              ) : null}

              {lp.commonCore.mathStandards?.length > 0 ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.text, { fontSize: 14, fontWeight: '500', marginBottom: 4 }]}>Math Standards</Text>
                  {lp.commonCore.mathStandards.map((s, i) => (
                    <Text key={i} style={[styles.textMuted, { fontSize: 14 }]}>• {s}</Text>
                  ))}
                </View>
              ) : null}

              {lp.commonCore.elaStandards?.length > 0 ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.text, { fontSize: 14, fontWeight: '500', marginBottom: 4 }]}>ELA Standards</Text>
                  {lp.commonCore.elaStandards.map((s, i) => (
                    <Text key={i} style={[styles.textMuted, { fontSize: 14 }]}>• {s}</Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </>
  )
}
