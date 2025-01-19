import { Button } from '@/components/button';
import { FormControl } from '@/components/form/form-control';
import { TextField } from '@/components/form/text-field';
import { FC } from 'react';

export const Answer: FC<{
  question: string;
  highlight: string | null;
  answer: string;
  handleChange: (answer: string) => void;
  handleAnswer: () => void;
}> = ({
  question,
  highlight,
  answer,
  handleChange,
  handleAnswer,
}) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {highlight && (
        <p className="font-notoSansJp text-9xl">{highlight}</p>
      )}
      <FormControl
        label={question}
        renderInput={({ labelId: _, ...props }) => {
          return (
            <TextField
              {...props}
              value={answer}
              onChange={handleChange}
              isRequired
            />
          );
        }}
      />
      <Button onClick={handleAnswer}>解答する</Button>
    </div>
  );
};
