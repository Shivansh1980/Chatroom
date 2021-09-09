import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
library.add(
    faGoogle,
    faArrowDown
);

export const google_icon = icon({ prefix: 'fab', iconName: 'google' }).html;
// export const arrow_down_icon = icon({ prefix: 'fas', iconName: 'faArrowDown' }).html;
