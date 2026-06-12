import appSettings from "~/settings/appSetting";

type CardProps = {
  children: React.ReactNode;
};
console.log(appSettings.cardSize);
// const wrapperStyles = ``
function CardWrapper({ children }: CardProps) {
  return (
    <div
      className={`grid gap-[9px] p-[10px]`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, ${appSettings.cardSize}px)`,
      }}
    >
      {children}
    </div>
  );
}

export default CardWrapper;
