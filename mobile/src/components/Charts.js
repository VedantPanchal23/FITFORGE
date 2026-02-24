/**
 * Chart Components using Victory Native
 * Beautiful, animated charts for progress visualization
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryBar, VictoryArea, VictoryAxis, VictoryTheme, VictoryPie, VictoryScatter, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * Weekly Line Chart - for life score trends
 */
export function WeeklyLineChart({ data, color, height = 150 }) {
    const { theme } = useTheme();

    // data format: [{ x: 'Mon', y: 75 }, ...]
    return (
        <View style={styles.chartContainer}>
            <VictoryChart
                width={width - 40}
                height={height}
                padding={{ left: 40, right: 20, top: 10, bottom: 30 }}
                domainPadding={{ x: 15 }}
            >
                <VictoryAxis
                    style={{
                        axis: { stroke: theme.cardBorder },
                        tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                        grid: { stroke: 'transparent' }
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: theme.textSecondary, fontSize: 10 },
                        grid: { stroke: theme.cardBorder, strokeDasharray: '4,4' }
                    }}
                />
                <VictoryArea
                    data={data}
                    style={{
                        data: { fill: color + '30', stroke: color, strokeWidth: 2 }
                    }}
                    animate={{ duration: 800, easing: 'cubicInOut' }}
                />
                <VictoryScatter
                    data={data}
                    size={4}
                    style={{ data: { fill: color } }}
                    animate={{ duration: 800 }}
                />
            </VictoryChart>
        </View>
    );
}

/**
 * Weekly Bar Chart - for daily scores
 */
export function WeeklyBarChart({ data, color, height = 120 }) {
    const { theme } = useTheme();

    return (
        <View style={styles.chartContainer}>
            <VictoryChart
                width={width - 40}
                height={height}
                padding={{ left: 30, right: 20, top: 10, bottom: 30 }}
                domainPadding={{ x: 20 }}
            >
                <VictoryAxis
                    style={{
                        axis: { stroke: theme.cardBorder },
                        tickLabels: { fill: theme.textSecondary, fontSize: 9 },
                        grid: { stroke: 'transparent' }
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t}`}
                    style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: theme.textSecondary, fontSize: 9 },
                        grid: { stroke: theme.cardBorder, strokeDasharray: '3,3' }
                    }}
                />
                <VictoryBar
                    data={data}
                    style={{
                        data: { fill: color, borderRadius: 4 }
                    }}
                    cornerRadius={{ top: 4 }}
                    animate={{ duration: 600, easing: 'bounce' }}
                />
            </VictoryChart>
        </View>
    );
}

/**
 * Domain Progress Ring - for domain completion
 */
export function DomainRing({ value, color, size = 100, strokeWidth = 8 }) {
    const { theme } = useTheme();

    const data = [
        { x: 'Complete', y: value },
        { x: 'Remaining', y: 100 - value }
    ];

    return (
        <View style={[styles.ringContainer, { width: size, height: size }]}>
            <VictoryPie
                data={data}
                width={size}
                height={size}
                innerRadius={size / 2 - strokeWidth}
                radius={size / 2}
                padding={0}
                style={{
                    data: {
                        fill: ({ datum }) => datum.x === 'Complete' ? color : theme.cardBorder
                    }
                }}
                animate={{ duration: 800 }}
                labels={() => null}
            />
            <View style={[styles.ringCenter, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
                <Text style={[styles.ringValue, { color: theme.text }]}>{value}%</Text>
            </View>
        </View>
    );
}

/**
 * Multi-domain Progress Chart
 */
export function DomainProgressChart({ domains, height = 200 }) {
    const { theme } = useTheme();

    // domains format: [{ name: 'Body', value: 80, color: '#FF6B6B' }, ...]
    const data = domains.map((d, i) => ({ x: d.name, y: d.value }));

    return (
        <View style={styles.chartContainer}>
            <VictoryChart
                width={width - 40}
                height={height}
                padding={{ left: 60, right: 20, top: 10, bottom: 20 }}
                domainPadding={{ y: 15 }}
            >
                <VictoryAxis
                    style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: theme.textSecondary, fontSize: 11, fontWeight: '500' },
                        grid: { stroke: 'transparent' }
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    tickFormat={(t) => `${t}%`}
                    style={{
                        axis: { stroke: 'transparent' },
                        tickLabels: { fill: theme.textSecondary, fontSize: 9 },
                        grid: { stroke: theme.cardBorder, strokeDasharray: '3,3' }
                    }}
                />
                <VictoryBar
                    horizontal
                    data={data}
                    style={{
                        data: {
                            fill: ({ index }) => domains[index]?.color || theme.primary
                        }
                    }}
                    cornerRadius={{ bottom: 4, top: 4 }}
                    barWidth={18}
                    animate={{ duration: 600 }}
                />
            </VictoryChart>
        </View>
    );
}

/**
 * Trend Sparkline - mini line chart for stats
 */
export function TrendSparkline({ data, color, width: chartWidth = 80, height: chartHeight = 30 }) {
    return (
        <View style={{ width: chartWidth, height: chartHeight }}>
            <VictoryLine
                data={data}
                width={chartWidth}
                height={chartHeight}
                padding={0}
                style={{
                    data: { stroke: color, strokeWidth: 2 }
                }}
                animate={{ duration: 500 }}
            />
        </View>
    );
}

/**
 * Sleep Quality Distribution Pie
 */
export function SleepQualityPie({ good, average, poor, size = 120 }) {
    const { theme } = useTheme();

    const data = [
        { x: 'Good', y: good, color: '#4ECDC4' },
        { x: 'Average', y: average, color: '#FBBF24' },
        { x: 'Poor', y: poor, color: '#F87171' }
    ];

    return (
        <View style={[styles.ringContainer, { width: size, height: size }]}>
            <VictoryPie
                data={data}
                width={size}
                height={size}
                innerRadius={size / 4}
                radius={size / 2}
                padding={0}
                style={{
                    data: {
                        fill: ({ datum }) => datum.color
                    }
                }}
                animate={{ duration: 600 }}
                labels={() => null}
            />
        </View>
    );
}

/**
 * Macro Distribution Chart
 */
export function MacroChart({ protein, carbs, fats, size = 100 }) {
    const data = [
        { x: 'Protein', y: protein, color: '#FF6B6B' },
        { x: 'Carbs', y: carbs, color: '#FBBF24' },
        { x: 'Fats', y: fats, color: '#4ECDC4' }
    ];

    return (
        <View style={[styles.ringContainer, { width: size, height: size }]}>
            <VictoryPie
                data={data}
                width={size}
                height={size}
                innerRadius={size / 3}
                radius={size / 2}
                padding={0}
                style={{
                    data: {
                        fill: ({ datum }) => datum.color
                    }
                }}
                animate={{ duration: 600 }}
                labels={() => null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        alignItems: 'center',
        marginVertical: 8
    },
    ringContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ringCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center'
    },
    ringValue: {
        fontSize: 18,
        fontWeight: '700'
    }
});

export default {
    WeeklyLineChart,
    WeeklyBarChart,
    DomainRing,
    DomainProgressChart,
    TrendSparkline,
    SleepQualityPie,
    MacroChart
};
