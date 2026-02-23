import {Spinner} from '@heroui/react';

// region Interface

interface IProps {
  label: string;
  size: 'sm'|'md'|'lg'
}

// endregion

// region Component

/**
 * generic spinner used to indicate loading
 * @param label to be used for this spinner
 * @param size size of the spinner
 */
const Loading = ({label, size = 'md'}: IProps) => {

  return <>
    <Spinner classNames={{label: "text-foreground mt-4"}}
             label={label}
             size={size}
             color={'secondary'}
             variant={'gradient'} />
  </>;
};

// endregion

// region Export

export default Loading;

// endregion