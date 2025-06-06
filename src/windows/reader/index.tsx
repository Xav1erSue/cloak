import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useRequest } from 'ahooks';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export default function ReaderWindow() {
  const { data: line, refresh } = useRequest(() => invoke<string>('get_line'));

  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();

    const focusListener = win.listen('tauri://focus', () => {
      setIsFocus(true);
      refresh();
      win.setDecorations(true);
    });

    const blurListener = win.listen('tauri://blur', () => {
      setIsFocus(false);
      win.setDecorations(false);
    });

    return () => {
      focusListener.then((unListen) => unListen());
      blurListener.then((unListen) => unListen());
    };
  }, [refresh]);

  return (
    <div className={clsx('reader-window', { 'is-focus': isFocus })}>
      {line ? line : <p>请从托盘菜单打开一本小说</p>}
    </div>
  );
}
