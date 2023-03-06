import img1 from '../assets/avatars/img1.png';
import img2 from '../assets/avatars/img2.png';
import img3 from '../assets/avatars/img3.png';
import img4 from '../assets/avatars/img4.png';
import img5 from '../assets/avatars/img5.png';
import img6 from '../assets/avatars/img6.png';
import img7 from '../assets/avatars/img7.png';
import img8 from '../assets/avatars/img8.png';
import img9 from '../assets/avatars/img9.png';
import img10 from '../assets/avatars/img10.png';
import img11 from '../assets/avatars/img11.png';
import img12 from '../assets/avatars/img12.png';
import img13 from '../assets/avatars/img13.png';
import img14 from '../assets/avatars/img14.png';
import img15 from '../assets/avatars/img15.png';
import img16 from '../assets/avatars/img16.png';
import img17 from '../assets/avatars/img17.png';
import img18 from '../assets/avatars/img18.png';
import img19 from '../assets/avatars/img19.png';
import img20 from '../assets/avatars/img20.png';

const avatarMap = {
  img_1: img1,
  img_2: img2,
  img_3: img3,
  img_4: img4,
  img_5: img5,
  img_6: img6,
  img_7: img7,
  img_8: img8,
  img_9: img9,
  img_10: img10,
  img_11: img11,
  img_12: img12,
  img_13: img13,
  img_14: img14,
  img_15: img15,
  img_16: img16,
  img_17: img17,
  img_18: img18,
  img_19: img19,
  img_20: img20,
};
function getAvatarByUserId(id: number) {
  if (id === 1) {
    return img1;
  }
  if (id === 2) {
    return img2;
  }
  if (id === 3) {
    return img3;
  }
  if (id === 4) {
    return img4;
  }
  if (id === 5) {
    return img5;
  }
  if (id === 6) {
    return img6;
  }
  if (id === 7) {
    return img7;
  }
  if (id === 8) {
    return img8;
  }
  if (id === 9) {
    return img9;
  }
  if (id === 10) {
    return img1;
  }

  if (id === 11) {
    return img10;
  }

  if (id === 12) {
    return img12;
  }
  if (id === 13) {
    return img13;
  }
  if (id === 14) {
    return img14;
  }
  if (id === 15) {
    return img15;
  }
  if (id === 16) {
    return img16;
  }
  if (id === 17) {
    return img17;
  }
  if (id === 18) {
    return img18;
  }
  if (id === 19) {
    return img19;
  }
  if (id === 20) {
    return img20;
  }
}

export { avatarMap,getAvatarByUserId };
