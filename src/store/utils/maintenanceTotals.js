export const withMaintenanceTotals = (order) => {
  const partsCost = (order.parts || []).reduce(
    (acc, part) => acc + (part.quantity || 0) * (part.unitCost || 0),
    0
  );
  const laborCost =
    (Number(order.laborHours) || 0) * (Number(order.laborRate) || 0);
  const otherCosts = Number(order.otherCosts || 0);
  return {
    ...order,
    partsCost,
    laborCost,
    totalCost: partsCost + laborCost + otherCosts,
  };
};

export const calculateMaintenanceTotals = (orders = []) =>
  orders.map((order) => withMaintenanceTotals(order));
