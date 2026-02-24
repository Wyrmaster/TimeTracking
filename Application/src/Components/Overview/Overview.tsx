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

/**
 * A functional component that displays an overview of activities and a table grid layout.
 *
 * This component manages the loading and display of activities. It fetches activities data on component
 * mount, shows loading indicators while fetching, and renders the activities in a list format along with
 * a flexible grid layout for additional table content.
 *
 * State:
 * - `loadingActivities` (boolean): Indicates whether activities data is currently being loaded.
 * - `activities` (IActivityDto[]): Stores the list of activities fetched from the data source.
 *
 * Dependencies:
 * - `useActivity()` hook: Provides access to the `loadActivities` function for fetching activities data.
 * - `useEffect`: Used to execute the data loading logic when the component is mounted.
 *
 * Children Components:
 * - `<Loading>`: Displays a loading indicator with a label when activities are being fetched.
 * - `<Activity>`: Renders each activity in the fetched list. Each activity entry is a child component.
 * - `<TableGrid>`: Represents an additional section displayed alongside the activities list in a table grid format.
 *
 * Classes:
 * - Uses a combination of CSS classes for flex layout, spacing, and overflow handling.
 *
 * Props:
 * - `IProps`: An object containing the props passed to this component.
 */
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