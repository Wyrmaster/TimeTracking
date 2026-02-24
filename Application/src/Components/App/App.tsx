import classes from './App.module.scss';
import {Routes, Route, Navigate} from 'react-router-dom';
import {rts} from '../../Common/Routes.ts';
// @ts-ignore
import '../../Extensions/Extensions.ts'
import {settings} from '../../Common/Settings.ts';

import Home from '../Home/Home.tsx';
import Authentication from '../Authentication/Authentication.tsx';
import Activities from '../Activities/Activities.tsx';
import Loading from '../Loading/Loading.tsx';
import Overview from '../Overview/Overview.tsx';
import {GridProvider} from '../../Providers/GridProvider.tsx';
import Workspaces from '../Workspaces/Workspaces.tsx';
import Register from '../Register/Register.tsx';

/**
 * Global component entry point
 */
const App = () =>
  <>
    <div
      className={['flex', 'flex-col', 'min-h-screen', 'bg-background', 'text-foreground', 'overflow-hidden', classes.app].join(' ')}>
      <Routes>
        <Route path="/"
               element={
                 settings.GetToken() == null
                   ? <Navigate to={rts.Authentication}/>
                   : <Navigate to={rts.Home}/>
               }
        />

        <Route path={rts.Authentication} element={<Authentication/>}/>
        <Route path={rts.Register} element={<Register/>}/>
        <Route path={rts.Home} element={<Home/>}>
          <Route path={rts.Overview}
                 element={
                   <GridProvider>
                     <Overview/>
                   </GridProvider>
                 }/>
          <Route path={rts.Activities} element={<Activities/>}/>
          <Route path={rts.Workspaces} element={<Workspaces/>}/>
        </Route>
        <Route path={'*'} element={<Loading size={'lg'} label={'Loading ...'}/>}/>

      </Routes>
    </div>
  </>

export default App;
