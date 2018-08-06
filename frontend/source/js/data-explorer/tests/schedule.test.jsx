import toJson from 'enzyme-to-json';

import { Schedule } from '../components/schedule';
import makeSetup from './testSetup';
import { scheduleLabels } from '../schedule-metadata';

const defaultProps = {
  schedule: '',
  idPrefix: 'zzz_',
  setSchedule: jest.fn(),
};

const setup = makeSetup(Schedule, defaultProps);

describe('<Schedule>', () => {
  it('renders correctly', () => {
    const { wrapper } = setup();
    const select = wrapper.find('select#zzz_schedule');
    expect(select.exists()).toBeTruthy();
    const options = wrapper.find('option');
    // should have options for all schedules + 1 for "(all)"
    expect(options.length).toBe(Object.keys(scheduleLabels).length + 1);
    Object.keys(scheduleLabels).forEach((sched) => {
      const title = scheduleLabels[sched];
      const opt = wrapper.find(`option[value="${sched}"]`);
      expect(opt.exists()).toBeTruthy();
      expect(opt.text()).toBe(title);
    });
  });

  it('matches snapshot', () => {
    const { wrapper } = setup();
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('calls setSchedule on change', () => {
    const { props, mounted } = setup();
    expect(props.setSchedule.mock.calls.length).toBe(0);

    mounted.find('select#zzz_schedule')
      .simulate('change', { target: { value: 'MOBIS' } });

    expect(props.setSchedule.mock.calls.length).toBe(1);
    expect(props.setSchedule.mock.calls[0][0]).toBe('MOBIS');
  });

  it('has filter_active class when levels are selected', () => {
    let { wrapper } = setup({ schedule: '' });
    expect(wrapper.find('select.filter_active').exists()).toBeFalsy();

    ({ wrapper } = setup({ schedule: 'PES' }));
    expect(wrapper.find('select.filter_active').exists()).toBeTruthy();
  });
});
