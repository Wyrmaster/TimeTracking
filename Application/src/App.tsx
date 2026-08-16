import './App.css'
import {Navigate, Route, Routes} from 'react-router-dom';
import {rts} from './common/routes.ts';
import {settings} from './common/settings.ts';
import {Authentication} from './pages/authentication/authentication.tsx';
import {Register} from './pages/register/register.tsx';
import {Home} from './pages/home/home.tsx';
import {Activities} from './pages/activities/activities.tsx';
import {Workspaces} from './pages/workspaces/workspaces.tsx';
import {Statistics} from './pages/statistics/statistics.tsx';
import {Overview} from './pages/overview/overview.tsx';

const App = () => {

  return (
    <>
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
          <Route index element={<Navigate to={rts.Overview}/>}/>
          <Route path={rts.Activities} element={<Activities/>}/>
          <Route path={rts.Workspaces} element={<Workspaces/>}/>
          <Route path={rts.Statistics} element={<Statistics/>}/>
          <Route path={rts.Overview} element={<Overview/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
