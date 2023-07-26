type Props = {
  title: string;
  content: string;
};

const NotePreview = ({ title, content }: Props) => {
  return (
    <span className="note-preview block col-span-2 rounded shadow-inner p-5 bg-gray-50 cursor-pointer text-lg hover:bg-gray-100 hover:border-transparent mb-3">
      <span className="block font-bold leading-snug tracking-tight truncate mb-1">
        {title}
      </span>
      <span className="block font-normal text-gray-600 whitespace-pre-line max-h-[150px] truncate">
        {content}
      </span>
    </span>
  );
};

export default NotePreview;
