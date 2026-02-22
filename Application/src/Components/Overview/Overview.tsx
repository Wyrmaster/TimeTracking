// import classes from './Overview.module.scss';
import {useActivity} from '../../Providers/ActivityProvider.tsx';
import {useEffect, useState} from 'react';
import {IActivityDto} from '../../Network/Intents/Activities/IActivityDto.ts';
import Loading from '../Loading/Loading.tsx';
import Activity from '../Activity/Activity.tsx';
import TableGrid from './TableGrid/TableGrid.tsx';

// region Interface

interface IProps {

}

// endregion

// region Component

const Overview = ({}: IProps) => {

  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const {loadActivities} = useActivity();
  const [activities, setActivities] = useState<IActivityDto[]>([]);

  useEffect(() => {
    loadActivities(null, state => setLoadingActivities(state), a => setActivities(a)).then();
  }, []);

  return <>
    <div className={['flex', 'flex-row', 'grow', 'gap-5', 'overflow-hidden'].join(' ')}>
      <div className={['flex', 'flex-col', 'gap-1', 'overflow-y-auto'].join(' ')}>
        <div className={['flex', 'grow', 'flex-col'].join(' ')}>
          {
            loadingActivities
              ? <Loading label={'Loading Activities'} size={'md'}/>
              : activities.map((value) => <Activity key={`activity_${value.id}`}
                                                    activity={value}
                                                    canEdit={false}
                                                    showDescription={false}/>)
          }
        </div>
      </div>
      <div className={['flex', 'grow'].join(' ')}>
        <TableGrid/>
      </div>
    </div>
  </>;
};

// endregion

// region Export

export default Overview;

// endregion