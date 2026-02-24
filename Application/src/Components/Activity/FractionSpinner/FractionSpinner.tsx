import classes from './FractionSpinner.module.scss';

// region Interface

interface IProps {

}

// endregion

// region Component

/**
 * FractionSpinner is a React functional component that renders a spinning fractional arc animation.
 *
 * The animation consists of a series of arcs arranged in a circular pattern, with a gap between each arc.
 * This component can be used to display a visually appealing loading spinner.
 *
 * @param {IProps} props - The props object for customizing the component's behavior and style (unused in this implementation).
 *
 * Arcs Details:
 * - Radius: 120 units.
 * - Number of Sections: 8.
 * - Gap Between Arcs: 8 degrees.
 * - Arc Angle: Calculated as (360 - 8 * 8) / 8 = 37 degrees.
 */
const FractionSpinner = ({}: IProps) =>
  <>
    <div>

      <svg className={classes.spinner}
           viewBox="-150 -150 300 300" xmlns="http://www.w3.org/2000/svg">
        {/*radius = 120*/}
        {/*sections = 8*/}
        {/*gap = 8°*/}
        {/*arc angle = (360 - 8×8) / 8 = 37°*/}

        <g>

          {/*Base arc (37°)*/}
          {/*Start: (120,0)*/}
          {/*End:   (120*cos37°, 120*sin37°) = (95.84, 72.22)*/}

          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(4)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(49)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(94)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(139)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(184)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(229)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(274)"/>
          <path d="M 120 0 A 120 120 0 0 1 95.84 72.22" transform="rotate(319)"/>

        </g>
      </svg>

    </div>
  </>;

// endregion

// region Export

export default FractionSpinner;

// endregion