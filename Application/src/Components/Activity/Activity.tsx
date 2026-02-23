import classes from './Activity.module.scss';
import {IActivityDto} from '../../Network/Intents/Activities/IActivityDto.ts';
import {Button, Card, CardBody, CardFooter, CardHeader} from '@heroui/react';
import {useActivity} from '../../Providers/ActivityProvider.tsx';
import Timer from './Timer/Timer.tsx';
import {IntToHex} from '../../Common/Transformer.ts';
import Svg from '../Svg/Svg.tsx';

// region Interface

interface IProps {
  activity: IActivityDto;
  showDescription: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
  startTracking?: () => void;
  stopTracking?: () => void;
}

// endregion

// region Component

const Activity = (
  {
    activity,
    canEdit = true,
    onEdit = () => {},
    showDescription = false
  }: IProps) => {

  const {activeActivity, startTracking, stopTracking} = useActivity();

  return <>
    <Card style={{
            backgroundColor: IntToHex(activity.activityColor)
          }} className={[classes.activity].join(' ')}>
      <CardHeader>
        <div className={classes.header}>
          <span style={{flexGrow: '1'}}>{activity.name}</span>
          {
            activeActivity != null && activeActivity.id == activity.id
            ? <></>
            : <Button isIconOnly={true}
                      style={{backgroundColor : '#ffffff00', color: '#ffffff'}}
                      variant={'light'}
                      onPress={() => startTracking(activity.id)}>
                <Svg className={classes.button}
                     viewBox={'0 -960 960 960'}
                     path={'M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z'}/>
              </Button>
          }
          {
            activeActivity != null && activeActivity.id == activity.id
            ? <Button isIconOnly={true}
                      style={{backgroundColor: '#ffffff00', color: '#ffffff'}}
                      variant={'light'}
                      onPress={() => stopTracking()}>
                <Svg className={classes.button}
                     viewBox={'0 -960 960 960'}
                     path={'M240-320v-320q0-33 23.5-56.5T320-720h320q33 0 56.5 23.5T720-640v320q0 33-23.5 56.5T640-240H320q-33 0-56.5-23.5T240-320Z'}/>
              </Button>
            : <></>
          }

          {
            canEdit
              ? <Button isIconOnly={true}
                        style={{backgroundColor : '#ffffff00', color: '#ffffff'}}
                        variant={'light'}
                        onPress={onEdit}>
                  <Svg className={classes.button}
                       viewBox={'0 -960 960 960'}
                       path={'M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z'}/>
                </Button>
              : <></>
          }

        </div>
      </CardHeader>
      {
        showDescription && activity.description != null && activity.description != ''
          ? <CardBody>
              <span className={classes.description}>{activity.description}</span>
            </CardBody>
          : <></>
      }
      {
        activeActivity != null && activeActivity.id == activity.id
        ? <CardFooter className={[classes.timerForeground].join(' ')}>
            <Timer timestamp={new Date(activeActivity.trackingSince)} />
          </CardFooter>
        : <></>
      }
    </Card>
  </>;
};

// endregion

// region Export

export default Activity;

// endregion