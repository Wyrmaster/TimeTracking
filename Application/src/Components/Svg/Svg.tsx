// region Interface

interface IProps {
  className?: string|string[];
  path: string;
  viewBox?:string;
}

// endregion

// region Component

/**
 * Functional component for rendering an SVG element.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.path - The SVG path definition used for the `<path>` element.
 * @param {string | string[]} [props.className=[]] - The CSS class(es) applied to the `<svg>` element.
 *                                                  If an array is provided, it will be joined into a single string.
 * @param {string} [props.viewBox='0 0 24 24'] - The `viewBox` attribute of the `<svg>` element, defining the coordinate system and aspect ratio.
 * @returns {JSX.Element} A JSX element representing an SVG.
 */
const Svg = ({path, className = [], viewBox = '0 0 24 24'}: IProps) => {
  return <>
    <svg className={typeof className == 'string' ? className : className.join(' ')}
         viewBox={viewBox}>
      <path d={path} />
    </svg>
  </>;
};

// endregion

// region Export

export default Svg;

// endregion