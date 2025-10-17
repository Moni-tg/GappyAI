import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Text } from "react-native-paper";
import GlassCard from "../../components/GlassCard";
import GradientBackground from "../../components/GradientBackground";

const { width } = Dimensions.get('window');

export default function Graph() {
  // Mock data for different parameters over time
  const temperatureData = [
    { time: '00:00', value: 24.2 },
    { time: '04:00', value: 24.0 },
    { time: '08:00', value: 24.5 },
    { time: '12:00', value: 25.1 },
    { time: '16:00', value: 24.8 },
    { time: '20:00', value: 24.3 },
  ];

  const phData = [
    { time: '00:00', value: 7.2 },
    { time: '04:00', value: 7.1 },
    { time: '08:00', value: 7.0 },
    { time: '12:00', value: 6.9 },
    { time: '16:00', value: 7.0 },
    { time: '20:00', value: 7.1 },
  ];

  const turbidityData = [
    { time: '00:00', value: 5.2 },
    { time: '04:00', value: 5.0 },
    { time: '08:00', value: 4.5 },
    { time: '12:00', value: 4.1 },
    { time: '16:00', value: 4.8 },
    { time: '20:00', value: 5.3 },
  ];

  const ammoniaData = [
    { time: '00:00', value: 0.2 },
    { time: '04:00', value: 0.25 },
    { time: '08:00', value: 0.3 },
    { time: '12:00', value: 0.25 },
    { time: '16:00', value: 0.2 },
    { time: '20:00', value: 0.18 },
  ];

  // Chart component using react-native-chart-kit
  const SimpleBarChart = ({ data, title, color, unit }: { data: any[], title: string, color: string, unit: string }) => {
    const chartData = {
      labels: data.map(d => d.time),
      datasets: [{
        data: data.map(d => d.value),
        color: () => color,
      }]
    };

    const chartConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'transparent',
      backgroundGradientTo: 'transparent',
      decimalPlaces: 1,
      color: () => color,
      labelColor: () => '#9CA3AF',
      style: {
        borderRadius: 16,
      },
      propsForLabels: {
        fontSize: 10,
      }
    };

    return (
      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={[styles.chartValue, { color }]}>
            {data[data.length - 1]?.value}{unit}
          </Text>
        </View>
        <BarChart
          data={chartData}
          width={width - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars={false}
          yAxisLabel=""
          yAxisSuffix={unit}
        />
      </GlassCard>
    );
  };

  const SimpleLineChart = ({ data, title, color, unit }: { data: any[], title: string, color: string, unit: string }) => {
    const chartData = {
      labels: data.map(d => d.time),
      datasets: [{
        data: data.map(d => d.value),
        color: () => color,
        strokeWidth: 2,
      }]
    };

    const chartConfig = {
      backgroundColor: 'transparent',
      backgroundGradientFrom: 'transparent',
      backgroundGradientTo: 'transparent',
      decimalPlaces: 1,
      color: () => color,
      labelColor: () => '#9CA3AF',
      style: {
        borderRadius: 16,
      },
      propsForLabels: {
        fontSize: 10,
      }
    };

    return (
      <GlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={[styles.chartValue, { color }]}>
            {data[data.length - 1]?.value}{unit}
          </Text>
        </View>
        <LineChart
          data={chartData}
          width={width - 60}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={false}
          yAxisLabel=""
          yAxisSuffix={unit}
        />
      </GlassCard>
    );
  };

  return (
    <GradientBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>


        <SimpleLineChart
          data={temperatureData}
          title="Temperature Trend"
          color="#76D9DB"
          unit="°C"
        />

        <SimpleBarChart
          data={phData}
          title="pH Levels"
          color="#FF6B6B"
          unit=""
        />

        <SimpleLineChart
          data={turbidityData}
          title="Turbidity Levels"
          color="#4ECDC4"
          unit=" NTU"
        />

        <SimpleBarChart
          data={ammoniaData}
          title="Ammonia Levels"
          color="#FFE66D"
          unit=" ppm"
        />

      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
    alignItems: 'center',
  },
  analyticsCard: {
    padding: 16,
    alignItems: 'center',
  },
  timeRangeSelector: {
    alignItems: 'center',
  },
  timeRangeCard: {
    padding: 12,
    width: 200,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  chartCard: {
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  chartTitle: {
    color: "#EAF2FF",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    paddingVertical: 8,
  },
  barContainer: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    textAlign: 'center',
  },
  lineChartContainer: {
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    paddingTop: 8,
  },
  timeLabel: {
    color: "#9CA3AF",
    fontSize: 10,
    textAlign: 'center',
    width: 40,
  },
  headercontent:{
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

});
