import {useActiveActivity, useStartTracking, useStopTracking} from '../queries/tracking.ts';
import {Box, Flex, Text, Spinner, IconButton} from '@chakra-ui/react';
import type {IActivityDto} from '../network/intents/activities/activityDto.ts';
import {IntToHex} from '../common/transformer.ts';
import {FaPause, FaPlay} from 'react-icons/fa';
import {MdModeEdit} from 'react-icons/md';
import {Timer} from './timer.tsx';

interface IProps {
  activity: IActivityDto;
  includeDescription?: boolean;
  readonly?: boolean;
  canTrack?: boolean;
  grow?: boolean;
  edit?: (activity: IActivityDto) => void;
}

export const Activity = (
  {
    activity,
    includeDescription = true,
    readonly = false,
    canTrack = false,
    grow = true,
    edit = () => {},
  }: IProps) => {

  const {data: activeActivity} = useActiveActivity();
  const startTracking = useStartTracking();
  const stopTracking = useStopTracking();

  const isTracked: boolean = activeActivity != null && activeActivity.id == activity.id;

  return <>
    <Box padding={'1.25em'}
         flexGrow={grow ? '1' : '0'}
         flexShrink={grow ? '1' : '0'}
         flexBasis={'auto'}
         borderRadius={'xl'}
         margin={'1em'}
         position={'relative'}
         backgroundColor={`${IntToHex(activity.activityColor)}FF`}>
      <Flex flexDir={'column'}>
        <Flex flexDirection={'row'}
              gap={'0.75em'}
              alignItems={'center'}>
          <Text fontWeight={'bold'}
                fontSize={'1.15em'}
                color={'white'}
                flexGrow={'1'}>
            {activity.name}
          </Text>
          {
            isTracked
              ? <Spinner color={'white'}/>
              : <></>
          }
          {
            canTrack
              ? isTracked
                ? <IconButton onClick={() => stopTracking.mutate()}
                              loading={stopTracking.isPending}
                              size={'sm'}
                              color={'white'}
                              variant={'ghost'}
                              rounded={'full'}>
                    <FaPause />
                  </IconButton>
                : <IconButton onClick={() => startTracking.mutate(activity.id)}
                              loading={startTracking.isPending}
                              size={'sm'}
                              color={'white'}
                              variant={'ghost'}
                              rounded={'full'}>
                    <FaPlay />
                  </IconButton>
              : <></>
          }

        </Flex>
        {
          includeDescription
            ? <Text color={'white'}>{activity.description}</Text>
            : <></>
        }
        {
          isTracked
            ? <Text color={'white'}>
                <Timer timestamp={activeActivity!.trackingSince}/>
              </Text>
            : <></>
        }
      </Flex>
      {
        readonly
          ? <></>
          : <IconButton onClick={() => edit(activity)}
                        position={'absolute'}
                        top={'-1em'}
                        right={'-1em'}
                        opacity={0}
                        color={'white'}
                        _hover={ {opacity: 1} }
                        transition='opacity 0.2s'
                        variant={'subtle'}
                        rounded={'full'}>
              <MdModeEdit/>
            </IconButton>
      }
    </Box>
  </>;
};