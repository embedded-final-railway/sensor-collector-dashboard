export type Point = [number, number];

function distanceSquared(p1: Point, p2: Point): number {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
}

export function nearestPointOnLine(line: Point[], externalPoint: Point): Point {
  let closestPoint: Point | null = null;
  let minDistance = Infinity;

  for (let i = 0; i < line.length - 1; i++) {
    const start = line[i];
    const end = line[i + 1];

    const segmentVector = [end[0] - start[0], end[1] - start[1]];
    const pointVector = [externalPoint[0] - start[0], externalPoint[1] - start[1]];

    const segmentLengthSquared = distanceSquared(start, end);
    if (segmentLengthSquared === 0) continue; // Avoid division by zero

    const t = Math.max(0, Math.min(1, (pointVector[0] * segmentVector[0] + pointVector[1] * segmentVector[1]) / segmentLengthSquared));

    const projection: Point = [start[0] + t * segmentVector[0], start[1] + t * segmentVector[1]];
    const distance = distanceSquared(externalPoint, projection);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = projection;
    }
  }

  return closestPoint ?? externalPoint; // Fallback to the external point if no closest point is found.
}

function circleLineSegmentIntersections(
  p1: Point,
  p2: Point,
  center: Point,
  r: number
): Point[] {
  const intersections: Point[] = [];
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];

  // quadratic coefficients: a*t^2 + b*t + c = 0
  const a = dx * dx + dy * dy;
  const b = 2 * (dx * (p1[0] - center[0]) + dy * (p1[1] - center[1]));
  const c = (p1[0] - center[0]) ** 2 + (p1[1] - center[1]) ** 2 - r * r;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return intersections;
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const t1 = (-b + sqrtDiscriminant) / (2 * a);
  const t2 = (-b - sqrtDiscriminant) / (2 * a);

  [t1, t2].forEach((t) => {
    // Only include intersections that are on the segment (t in [0,1])
    if (t >= 0 && t <= 1) {
      const x = p1[0] + t * dx;
      const y = p1[1] + t * dy;
      intersections.push([x, y]);
    }
  });
  return intersections;
}

export function lineInsideCircle(
  line: Point[],
  center: Point,
  radius: number
): Point[][] {
  const segmentsInside: Point[][] = [];
  let currentSegment: Point[] = [];

  // Helper to “flush” a current segment if it exists.
  function flushSegment() {
    if (currentSegment.length > 0) {
      segmentsInside.push([...currentSegment]);
      currentSegment = [];
    }
  }

  // Helper to check if a point is inside the circle.
  const isInside = (p: Point) =>
    distanceSquared(p, center) <= radius * radius;

  // Process each segment of the polyline.
  for (let i = 0; i < line.length - 1; i++) {
    const p1 = line[i];
    const p2 = line[i + 1];
    const inside1 = isInside(p1);
    const inside2 = isInside(p2);

    // Get intersections from p1->p2 with the circle boundary.
    const segIntersections = circleLineSegmentIntersections(p1, p2, center, radius);

    // To know the order along the segment, compute an approximate t value.
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const intersectionsWithT = segIntersections.map((pt) => {
      // Use the dominant component to calculate t (avoids division by zero)
      const t = Math.abs(dx) > Math.abs(dy)
        ? (pt[0] - p1[0]) / dx
        : (pt[1] - p1[1]) / dy;
      return { t, pt };
    }).sort((a, b) => a.t - b.t);

    const sortedIntersections = intersectionsWithT.map((item) => item.pt);

    // Four situations for the endpoints:
    if (inside1 && inside2) {
      // Case 1: Both endpoints are inside.
      if (currentSegment.length === 0) {
        currentSegment.push(p1);
      }
      currentSegment.push(p2);
    } else if (inside1 && !inside2) {
      // Case 2: p1 is inside, but p2 is outside. Find exit point.
      if (currentSegment.length === 0) {
        currentSegment.push(p1);
      }
      if (sortedIntersections.length > 0) {
        // Assume the first intersection is where the line leaves the circle.
        currentSegment.push(sortedIntersections[0]);
      }
      flushSegment(); // End current segment because we left the circle.
    } else if (!inside1 && inside2) {
      // Case 3: p1 is outside, p2 is inside. Find entry point.
      // Start a new segment beginning at the intersection point.
      let newSegment: Point[] = [];
      if (sortedIntersections.length > 0) {
        newSegment.push(sortedIntersections[0]);
      } else {
        // Fall back; p2 is inside so use it directly.
        newSegment.push(p2);
      }
      newSegment.push(p2);
      currentSegment = newSegment;
    } else {
      // Case 4: Both endpoints are outside.
      // It might be that the segment still crosses the circle.
      if (sortedIntersections.length === 2) {
        // The segment cuts through the circle; store the inside segment.
        flushSegment(); // Flush any previous segment
        segmentsInside.push(sortedIntersections);
      } else {
        // No part of this segment is inside.
        flushSegment();
      }
    }
  }
  flushSegment();
  return segmentsInside;
}
