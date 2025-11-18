type Props = {
  className?: string;
};

const QuestionMarkIcon: React.FC<Props> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0ZM9 16C4.58172 16 1 12.4183 1 8C1 3.58172 4.58172 0 9 0C13.4183 0 17 3.58172 17 8C17 12.4183 13.4183 16 9 16Z"
        fill="currentColor"
      />
      <path
        d="M8 4H10V6H8V4ZM8 8H10V12H8V8Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default QuestionMarkIcon;
