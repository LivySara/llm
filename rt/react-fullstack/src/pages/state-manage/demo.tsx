import { useState } from 'react';
// 写法一
export default function Picture1() {
  const [isClickImg, setIsClickImg] = useState(false)
    console.log('执行', isClickImg)
  function handleImgClick(e) {
    e.stopPropagation();
    setIsClickImg(true)
  }
  function handleDivClick() {
    setIsClickImg(false)
  }
  return (
    <div
      className={`background${!isClickImg ? ' background--active' : ''}`}
      onClick={handleDivClick}>
      <img
        onClick={handleImgClick}
        className={`picture${isClickImg ? ' picture--active': ''}`}
        alt="Rainbow houses in Kampung Pelangi, Indonesia"
        src="https://react.dev/images/docs/scientists/5qwVYb1.jpeg"
      />
    </div>
  );
}


// 写法二
export function Picture2() {
  const [isActive, setIsActive] = useState(false);

  let backgroundClassName = 'background';
  let pictureClassName = 'picture';
  if (isActive) {
    pictureClassName += ' picture--active';
  } else {
    backgroundClassName += ' background--active';
  }

  return (
    <div
      className={backgroundClassName}
      onClick={() => setIsActive(false)}
    >
      <img
        onClick={e => {
          e.stopPropagation();
          setIsActive(true);
        }}
        className={pictureClassName}
        alt="Rainbow houses in Kampung Pelangi, Indonesia"
        src="https://react.dev/images/docs/scientists/5qwVYb1.jpeg"
      />
    </div>
  );
}
