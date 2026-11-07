import {useMemo, useState, type KeyboardEvent} from 'react';
import {Box, Flex, Text} from '@chakra-ui/react';
import {IntToHex, IntToTextColor} from '../common/transformer.ts';

// region Constants

/**
 * Center of the square the chart is drawn in, in user units
 */
const CENTER: number = 50;

/**
 * Outer radius of the ring
 */
const OUTER_RADIUS: number = 38;

/**
 * Inner radius of the ring
 */
const INNER_RADIUS: number = 24;

/**
 * Width of the gap kept free between two neighboring arcs, in user units
 */
const GAP: number = 1.6;

/**
 * Smallest width an arc keeps after the gap has been cut off, so tiny segments stay visible
 * instead of collapsing
 */
const MIN_WIDTH: number = 0.75;

/**
 * Distance every arc is pulled out of the center, in user units
 */
const OFFSET: number = 2;

/**
 * Distance an arc is pulled out of the center while it is hovered or selected
 */
const ACTIVE_OFFSET: number = 5;

/**
 * Color used for segments without a color of their own
 */
const FALLBACK_COLOR: number = 0x6B7280;

// endregion

/**
 * A single part of the whole the chart displays
 */
export interface IDonutSegment {
  label: string;
  value: number;
  color: number;
}

/**
 * A segment enriched with everything needed to draw it
 */
interface IArc {
  segment: IDonutSegment;
  share: number;
  path: string;
  color: string;
  textColor: string;
  labelPosition: [number, number];
  offsetDirection: [number, number];
}

interface IProps {
  segments: IDonutSegment[];
  formatValue?: (value: number) => string;
  onSegmentClick?: (segment: IDonutSegment|null, index: number) => void;
  size?: string;
}

/**
 * Converts an angle on the circle into a point, measured clockwise from twelve o'clock.
 * @param angle The angle in degrees.
 * @param radius The distance from the center.
 */
const toPoint = (angle: number, radius: number): [number, number] => {
  const radians: number = ((angle - 90) * Math.PI) / 180;

  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)];
};

/**
 * Converts a distance along the circle into the angle it covers at the given radius.
 * @param distance The distance in user units.
 * @param radius The distance from the center the distance is measured at.
 */
const toAngle = (distance: number, radius: number): number =>
  (distance / radius) * (180 / Math.PI);

/**
 * Cuts the given inset off both ends of an angular range, converted into an angle at the given
 * radius. Because the inset is a distance and not an angle, the gap it leaves is the same width
 * at the inner and at the outer radius instead of fanning out.
 *
 * A negative inset stretches the range instead of shortening it, which is what compensating for
 * the arcs being pulled out of the center needs. Ranges too narrow to be cut are stretched to
 * the smallest allowed width, so they stay visible.
 *
 * @param start The angle the range starts at.
 * @param end The angle the range ends at.
 * @param distance The distance to cut off both ends.
 * @param radius The distance from the center the range is drawn at.
 */
const inset = (start: number, end: number, distance: number, radius: number): [number, number] => {
  const limit: number = (end - start - toAngle(MIN_WIDTH, radius)) / 2;
  const angle: number = Math.min(toAngle(distance, radius), limit);

  return [start + angle, end - angle];
};

/**
 * Builds the path of a single arc of the ring, an outer and an inner circle segment joined by
 * two straight lines.
 * @param startAngle The angle the arc starts at.
 * @param endAngle The angle the arc ends at.
 * @param gap The distance to keep free at both ends of the arc.
 */
const toArcPath = (startAngle: number, endAngle: number, gap: number): string => {
  const [outerStart, outerEnd] = inset(startAngle, endAngle, gap, OUTER_RADIUS);
  const [innerStart, innerEnd] = inset(startAngle, endAngle, gap, INNER_RADIUS);

  const [outerStartX, outerStartY] = toPoint(outerStart, OUTER_RADIUS);
  const [outerEndX, outerEndY] = toPoint(outerEnd, OUTER_RADIUS);
  const [innerEndX, innerEndY] = toPoint(innerEnd, INNER_RADIUS);
  const [innerStartX, innerStartY] = toPoint(innerStart, INNER_RADIUS);

  const largeOuterArc: number = outerEnd - outerStart > 180 ? 1 : 0;
  const largeInnerArc: number = innerEnd - innerStart > 180 ? 1 : 0;

  return `M ${outerStartX} ${outerStartY} `
    + `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeOuterArc} 1 ${outerEndX} ${outerEndY} `
    + `L ${innerEndX} ${innerEndY} `
    + `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeInnerArc} 0 ${innerStartX} ${innerStartY} Z`;
};

/**
 * Renders the given segments as a ring of arcs, one arc per segment, sized by the share the
 * segment has of the sum of all values and colored with the color of the segment.
 *
 * Every arc is pulled slightly out of the center, which keeps the arcs apart, and hovering or
 * selecting an arc pulls it out a bit further. Arcs big enough to hold it are labeled with their
 * percentage, all other percentages are only shown in the legend below the ring. The center of
 * the ring describes the hovered or selected segment and falls back to the total of all values.
 *
 * Clicking an arc or its entry in the legend selects it, clicking it again clears the selection.
 *
 * @param segments The segments to display.
 * @param formatValue Converts the value of a segment into the text shown for it.
 * @param onSegmentClick Called with the clicked segment, also when the selection is cleared.
 * @param size Width and height of the ring.
 */
export const DonutChart = (
  {
    segments,
    formatValue,
    onSegmentClick,
    size = '25rem',
  }: IProps) => {

  const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number|null>(null);

  const total: number = useMemo(
    () => segments.reduce((sum: number, segment: IDonutSegment) => sum + segment.value, 0),
    [segments],
  );

  const arcs: IArc[] = useMemo(() => {
    if (total <= 0) return [];

    let angle: number = 0;

    return segments.map((segment: IDonutSegment) => {
      const share: number = segment.value / total;

      const start: number = angle;
      angle += share * 360;

      const middle: number = (start + angle) / 2;

      // pulling the arc out of the center moves both of its ends away from their neighbor,
      // by this much, the wider the arc the more
      const spread: number = OFFSET * Math.sin((middle - start) * (Math.PI / 180));

      const [directionX, directionY] = toPoint(middle, 1);
      const color: number = segment.color || FALLBACK_COLOR;

      return {
        segment,
        share,
        // cut half of the gap off both ends, minus what pulling the arc out already opens up,
        // so every gap ends up the same width no matter how wide its neighbors are
        path: toArcPath(start, angle, GAP / 2 - spread),
        color: IntToHex(color),
        textColor: IntToTextColor(color),
        labelPosition: toPoint(middle, (INNER_RADIUS + OUTER_RADIUS) / 2),
        // the direction the arc is pulled out in, the unit vector pointing at its middle
        offsetDirection: [directionX - CENTER, directionY - CENTER],
      };
    });
  }, [segments, total]);

  const format = (value: number): string => formatValue?.(value) ?? value.toString();

  /**
   * Selects the segment at the given index, or clears the selection if it is already selected.
   * @param index The index of the segment.
   */
  const select = (index: number): void => {
    if (selectedIndex === index) {
      onSegmentClick?.(null, index);
    }
    else {
      onSegmentClick?.(segments[index], index);
    }
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const activeIndex: number|null = hoveredIndex ?? selectedIndex;
  const activeArc: IArc|null = activeIndex === null ? null : arcs[activeIndex] ?? null;

  return <>
    <Flex direction={'row'}
          align={'center'}
          margin={'auto'}
          gap={'4'}>
      <Box position={'relative'}>
        <svg viewBox={'0 0 100 100'}
             width={size}
             height={size}
             role={'img'}
             aria-label={'Share of the tracked time per activity'}
             onMouseLeave={() => setHoveredIndex(null)}>

          {/* placeholder ring, visible as long as there is nothing to show */}
          {arcs.length === 0 &&
            <path d={toArcPath(0, 360, GAP / 2)}
                  fill={'currentColor'}
                  opacity={0.12}/>
          }

          {arcs.map((arc: IArc, index: number) => {
            const isActive: boolean = index === hoveredIndex || index === selectedIndex;
            const offset: number = isActive ? ACTIVE_OFFSET : OFFSET;
            const [directionX, directionY] = arc.offsetDirection;

            return <g key={`${arc.segment.label}-${index}`}
                      style={{
                        transform: `translate(${directionX * offset}px, ${directionY * offset}px)`,
                        transition: 'transform 160ms ease-out',
                        cursor: onSegmentClick ? 'pointer' : 'default',
                        outline: 'none',
                      }}
                      tabIndex={0}
                      role={'button'}
                      aria-label={`${arc.segment.label}, ${format(arc.segment.value)}, `
                        + `${(arc.share * 100).toFixed(1)} percent`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onFocus={() => setHoveredIndex(index)}
                      onBlur={() => setHoveredIndex(null)}
                      onClick={() => select(index)}
                      onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;

                        event.preventDefault();
                        select(index);
                      }}>
              <path d={arc.path}
                    fill={arc.color}
                    stroke={arc.color}
                    strokeWidth={isActive ? 1 : 0}
                    strokeLinejoin={'round'}
                    opacity={activeIndex === null || isActive ? 1 : 0.55}
                    style={{transition: 'opacity 160ms ease-out'}}/>
            </g>;
          })}
        </svg>

        {/* description of the hovered or selected segment, centered in the hole of the ring */}
        <Flex position={'absolute'}
              inset={'0'}
              direction={'column'}
              align={'center'}
              justify={'center'}
              paddingX={'20%'}
              pointerEvents={'none'}>
          <Text textStyle={'xs'}
                color={'fg.muted'}
                textAlign={'center'}
                truncate>
            {activeArc?.segment.label ?? 'Total'}
          </Text>
          <Text textStyle={'lg'}
                fontWeight={'semibold'}
                lineHeight={'short'}
                textAlign={'center'}>
            {format(activeArc?.segment.value ?? total)}
          </Text>
          {activeArc &&
            <Text textStyle={'xs'}
                  color={'fg.muted'}>
              {`${(activeArc.share * 100).toFixed(1)}%`}
            </Text>
          }
        </Flex>
      </Box>

      {/* legend, so the segments can be told apart without relying on their color */}
      <Flex wrap={'wrap'}
            justify={'center'}
            direction={'column'}
            gapX={'4'}
            gapY={'1'}>
        {arcs.map((arc: IArc, index: number) => (
          <Flex key={`${arc.segment.label}-${index}`}
                align={'center'}
                gap={'2'}
                cursor={onSegmentClick ? 'pointer' : 'default'}
                opacity={activeIndex === null || index === activeIndex ? 1 : 0.6}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => select(index)}>
            <Box width={'0.65rem'}
                 height={'0.65rem'}
                 borderRadius={'sm'}
                 background={arc.color}
                 flexShrink={'0'}/>
            <Text textStyle={'sm'}
                  truncate>
              {arc.segment.label}
            </Text>
            <Text textStyle={'sm'}
                  color={'fg.muted'}>
              {formatValue ? formatValue(total * arc.share) : ''}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Flex>
  </>;
};
