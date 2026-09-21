import { CycleList } from "@/registry/clover-ui/cycle-list";

export function Demo() {
  return (
    <CycleList
      items={["Overconfidence", "Lack of reliability", "Missed deadlines"]}
    />
  );
}

export function BlueDemo() {
  return (
    <CycleList
      items={["Slower reviews", "Scope creep", "Missed deadlines"]}
      activeColor="#60A5FA"
    />
  );
}

export function FastDemo() {
  return (
    <CycleList
      items={["Distractions", "Context switching", "Multitasking"]}
      activeColor="#8B5CF6"
      interval={900}
    />
  );
}