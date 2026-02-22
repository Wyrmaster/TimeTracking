import {useRadio, VisuallyHidden, cn} from "@heroui/react";

// region Component

/**
 * A functional component that renders a customizable radio button with advanced styling and support
 * for custom descriptions. This component is built on top of `useRadio` for managing radio-specific
 * attributes and behaviors.
 *
 * @param {object} props - The properties passed to the component.
 * @param {React.ElementType} props.Component - The component to be used as the wrapper for the radio button.
 * @param {React.ReactNode} props.children - The label or content to display alongside the radio button.
 * @param {string} [props.description] - Additional descriptive text to display beneath the label.
 * @param {Function} props.getBaseProps - A function to get the base props for the wrapper component.
 * @param {Function} props.getInputProps - A function to get props for the underlying input element.
 * @param {Function} props.getLabelProps - A function to get props for the label element.
 * @param {Function} props.getLabelWrapperProps - A function to get props for the label wrapper element.
 */
const ActivityRadio = (props: any) => {

  const {
    Component,
    children,
    description,
    getBaseProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
  } = useRadio(props);

  return <>
    <Component
      {...getBaseProps({
        className: cn(
          'group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between tap-highlight-transparent m-0',
          'max-w-[300px] cursor-pointer border-2 border-default rounded-lg gap-4 p-4',
          'data-[selected=true]:border-primary',
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">{description}</span>
        )}
      </div>
    </Component>
    </>
};

// endregion

// region Export

export default ActivityRadio;

// endregion