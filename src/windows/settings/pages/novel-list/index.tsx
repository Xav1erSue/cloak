import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { safeDivide } from '@/lib/number';

interface Novel {
  id: string;
  title: string;
  path: string;
  last_read_position: number;
  total_characters: number;
}

const NovelList: React.FC = () => {
  const navigate = useNavigate();

  const { data: novelList, refresh } = useRequest(() =>
    invoke<Novel[]>('get_novel_list'),
  );
  const { data: currentNovel } = useRequest(() =>
    invoke<Novel>('get_current_novel'),
  );

  const handleDelete = (id: string) => {
    invoke('delete_novel', { id });
  };

  const handleAdd = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'txt', extensions: ['txt'] }],
    });
    await invoke('add_novel', { path: file });
    refresh();
  };

  const handleOpen = (id: string) => {
    invoke('open_novel', { id });
    refresh();
  };

  return (
    <section>
      <div className="flex justify-end">
        <Button onClick={handleAdd}>添加小说</Button>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4">
        {novelList?.map((novel) => {
          const progress =
            safeDivide(novel.last_read_position, novel.total_characters) * 100;
          return (
            <Card key={novel.id}>
              <CardHeader>
                <CardTitle>{novel.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-sm shrink-0">阅读进度：</div>
                  <Progress value={progress} />
                  <small>{progress.toFixed(2)}%</small>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {currentNovel?.id === novel.id ? (
                  <Button variant="secondary" onClick={() => navigate(`/`)}>
                    查看详情
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => handleOpen(novel.id)}
                    >
                      打开小说
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(novel.id)}
                    >
                      删除
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default NovelList;
