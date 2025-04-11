
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, FileText, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Episode {
  id: string;
  title: string;
  createdAt: Date;
  moduleCount: number;
}

interface EpisodeCardProps {
  episode: Episode;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EpisodeCard({ episode, onEdit, onDelete }: EpisodeCardProps) {
  const timeAgo = formatDistanceToNow(new Date(episode.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="glass-card overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{episode.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <FileText className="mr-1 h-3 w-3" />
            <span>{episode.moduleCount} {episode.moduleCount === 1 ? 'módulo' : 'módulos'}</span>
          </div>
          <div>{timeAgo}</div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onEdit(episode.id)}
        >
          <Edit2 className="h-4 w-4 mr-1" /> Editar
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(episode.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-200/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
