/**
 * FORGEBORN — WEIGHT CHART (SVG)
 * 
 * Smooth line chart for weight trends.
 * Built with react-native-svg.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors, radius } from '../theme/colors';

const WeightChart = ({
    data = [],       // [{ date, weight }]
    height = 140,
    color = colors.primary,
}) => {
    if (data.length < 2) {
        return (
            <View style={[styles.container, styles.empty, { height }]}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyText}>Need 2+ entries for chart</Text>
            </View>
        );
    }

    const padding = { top: 20, right: 15, bottom: 25, left: 40 };
    const width = 320; // Will stretch via viewBox
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const weights = data.map(d => d.weight);
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const rangeW = maxW - minW || 1;

    // Generate points
    const points = data.map((d, i) => ({
        x: padding.left + (i / (data.length - 1)) * chartW,
        y: padding.top + chartH - ((d.weight - minW) / rangeW) * chartH,
        weight: d.weight,
        date: d.date,
    }));

    // Smooth path (cardinal spline approximation)
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const cp = (points[i].x - points[i - 1].x) / 3;
        pathD += ` C ${points[i - 1].x + cp} ${points[i - 1].y}, ${points[i].x - cp} ${points[i].y}, ${points[i].x} ${points[i].y}`;
    }

    // Area fill path
    const areaD = pathD +
        ` L ${points[points.length - 1].x} ${padding.top + chartH}` +
        ` L ${points[0].x} ${padding.top + chartH} Z`;

    // Y-axis labels (3 ticks)
    const yTicks = [minW, (minW + maxW) / 2, maxW];

    // X-axis labels (first, middle, last)
    const xLabels = [
        { x: points[0].x, label: data[0].date.slice(5) },
        { x: points[Math.floor(points.length / 2)].x, label: data[Math.floor(data.length / 2)].date.slice(5) },
        { x: points[points.length - 1].x, label: data[data.length - 1].date.slice(5) },
    ];

    const lastPoint = points[points.length - 1];

    return (
        <View style={[styles.container, { height }]}>
            <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Grid lines */}
                {yTicks.map((tick, i) => {
                    const y = padding.top + chartH - ((tick - minW) / rangeW) * chartH;
                    return (
                        <Line
                            key={`grid-${i}`}
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke={colors.border}
                            strokeWidth={0.5}
                        />
                    );
                })}

                {/* Area fill */}
                <Path
                    d={areaD}
                    fill={color}
                    opacity={0.08}
                />

                {/* Line */}
                <Path
                    d={pathD}
                    stroke={color}
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Current point (glow) */}
                <Circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r={5}
                    fill={color}
                    opacity={0.3}
                />
                <Circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r={3}
                    fill={color}
                />

                {/* Y labels */}
                {yTicks.map((tick, i) => {
                    const y = padding.top + chartH - ((tick - minW) / rangeW) * chartH;
                    return (
                        <SvgText
                            key={`y-${i}`}
                            x={padding.left - 6}
                            y={y + 3}
                            fill={colors.textDim}
                            fontSize={9}
                            textAnchor="end"
                        >
                            {tick.toFixed(1)}
                        </SvgText>
                    );
                })}

                {/* X labels */}
                {xLabels.map((item, i) => (
                    <SvgText
                        key={`x-${i}`}
                        x={item.x}
                        y={height - 5}
                        fill={colors.textDim}
                        fontSize={8}
                        textAnchor="middle"
                    >
                        {item.label}
                    </SvgText>
                ))}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
    empty: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: { fontSize: 24, marginBottom: 4 },
    emptyText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textDim,
        letterSpacing: 0.5,
    },
});

export default WeightChart;
