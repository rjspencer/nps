import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, Stack } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc'

export default function LessonPlanDetailScreen() {
  const { lessonPlanId } = useLocalSearchParams<{ parkCode: string; lessonPlanId: string }>()
  const trpc = useTRPC()

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
        <View className="flex-1 bg-white px-4 pt-6 space-y-3">
          {[40, 24, 100].map((h, i) => (
            <View key={i} style={{ height: h }} className="rounded-lg bg-gray-100" />
          ))}
        </View>
      ) : isError || !lp ? (
        <View className="flex-1 bg-white px-4 pt-6">
          <Text className="text-red-500 text-sm">Could not load lesson plan.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-white" contentContainerClassName="px-4 pt-4 pb-10">
          <Text className="text-2xl font-bold text-gray-900">{lp.title}</Text>
          {meta ? <Text className="text-xs text-gray-400 mt-1">{meta}</Text> : null}

          {lp.questionObjective ? (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                Learning Objectives
              </Text>
              <Text className="text-sm text-gray-700 leading-relaxed">{lp.questionObjective}</Text>
            </View>
          ) : null}

          {hasStandards ? (
            <View className="mt-6">
              <Text className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                Educational Standards
              </Text>

              {lp.commonCore.stateStandards ? (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-900 mb-1">State Standards</Text>
                  <Text className="text-sm text-gray-600">{lp.commonCore.stateStandards}</Text>
                </View>
              ) : null}

              {lp.commonCore.additionalStandards ? (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-900 mb-1">Additional Standards</Text>
                  <Text className="text-sm text-gray-600">{lp.commonCore.additionalStandards}</Text>
                </View>
              ) : null}

              {lp.commonCore.mathStandards?.length > 0 ? (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-900 mb-1">Math Standards</Text>
                  {lp.commonCore.mathStandards.map((s, i) => (
                    <Text key={i} className="text-sm text-gray-600">• {s}</Text>
                  ))}
                </View>
              ) : null}

              {lp.commonCore.elaStandards?.length > 0 ? (
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-900 mb-1">ELA Standards</Text>
                  {lp.commonCore.elaStandards.map((s, i) => (
                    <Text key={i} className="text-sm text-gray-600">• {s}</Text>
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
