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