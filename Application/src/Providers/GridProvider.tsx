import * as React from 'react';

// region Interface

import {useContext, useState} from 'react';
import {IChildren} from '../Interfaces/IChildren.ts';

export interface IGridContext {
  cellHeight: number;
  changeCellHeight: (up: boolean) => void;
}

// endregion

// region Context

const GridContext: React.Context<IGridContext|null> = React.createContext<IGridContext|null>(null);

export const useGrid = () => {
  const context: IGridContext|null = useContext(GridContext);
  if (context == null) {
    throw new Error('useGrid must be used within the GridProvider');
  }

  return context;
}

// endregion

// region Provider

/**
 * GridProvider component that manages the state and context for grid cell height.
 * This component provides the `cellHeight` state and the `changeCellHeight` function
 * to its children via the `GridContext`.
 *
 * @param {IChildren} props - Props containing children elements to render within the context provider.
 * @returns {JSX.Element} A context provider wrapping its children.
 *
 * Context Value:
 * - `cellHeight` {number}: Represents the height of a grid cell. Default is 60.
 * - `changeCellHeight` {function}: Function to update the cellHeight. It accepts a single boolean parameter:
 *    - `true`: Decreases the cellHeight by 10, with a minimum limit of 50.
 *    - `false`: Increases the cellHeight by 10.
 */
export const GridProvider = ({children}: IChildren) => {

  const [cellHeight, setCellHeight] = useState<number>(60);

  const changeCellHeight = (up: boolean) => {
    if (!up) {
      setCellHeight(prevState => prevState + 10);
    } else {
      setCellHeight(prevState => {
        if (prevState == 50){
          return prevState;
        }

        return prevState - 10;
      });
    }
  }

  return <>
    <GridContext.Provider value={{ cellHeight, changeCellHeight }}>
      {children}
    </GridContext.Provider>
  </>
}

// endregion