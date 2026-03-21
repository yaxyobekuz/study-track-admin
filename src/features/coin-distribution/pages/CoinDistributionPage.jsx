// React
import { useEffect } from "react";

// Hooks
import useModal from "@/shared/hooks/useModal";
import useArrayStore from "@/shared/hooks/useArrayStore";
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { genderOptions } from "@/features/users/data/users.data";
import {
  filterTypeOptions,
  actionTypeOptions,
  roleFilterOptions,
} from "@/features/coin-distribution/data/coin-distribution.data";

// Components
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import InputField from "@/shared/components/ui/input/InputField";
import InputGroup from "@/shared/components/ui/input/InputGroup";
import SelectField from "@/shared/components/ui/select/SelectField";
import SelectAllUsers from "@/shared/components/ui/select/SelectAllUsers";
import ConfirmDistributionModal from "../components/ConfirmDistributionModal";

const CoinDistributionPage = () => {
  const { openModal } = useModal();
  const { getCollectionData } = useArrayStore("classes");
  const classes = getCollectionData();

  const {
    action,
    amount,
    reason,
    setField,
    filterType,
    resetState,
    filterValue,
  } = useObjectState({
    reason: "",
    amount: "",
    action: "give",
    filterValue: "",
    filterType: "role",
  });

  // Reset filterValue when filterType changes
  useEffect(() => {
    setField("filterValue", "");
  }, [filterType]);

  // Filter value select options based on filterType
  const renderFilterValueSelectField = () => {
    if (filterType === "role") {
      return (
        <SelectField
          required
          label="Rol"
          value={filterValue}
          placeholder="Rolni tanlang"
          options={roleFilterOptions}
          onChange={(v) => setField("filterValue", v)}
        />
      );
    }

    if (filterType === "class") {
      return (
        <SelectField
          required
          label="Sinf"
          value={filterValue}
          placeholder="Sinfni tanlang"
          onChange={(v) => setField("filterValue", v)}
          options={classes.map((c) => ({ value: c._id, label: c.name }))}
        />
      );
    }

    if (filterType === "gender") {
      return (
        <SelectField
          required
          label="Jins"
          value={filterValue}
          options={genderOptions}
          placeholder="Jinsni tanlang"
          onChange={(v) => setField("filterValue", v)}
        />
      );
    }

    if (filterType === "individual") {
      return (
        <SelectAllUsers
          value={filterValue}
          onChange={(v) => setField("filterValue", v)}
        />
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    openModal("confirmDistribution", {
      action,
      filterType,
      filterValue,
      reason: reason.trim(),
      onSuccess: resetState,
      amount: parseInt(amount, 10),
    });
  };

  return (
    <div>
      {/* Title */}
      <h1 className="page-title mb-4">Tanga tarqatish</h1>

      {/* Form */}
      <Card className="md:w-1/2">
        <InputGroup as="form" onSubmit={handleSubmit}>
          {/* Filter type */}
          <SelectField
            required
            value={filterType}
            label="Filter turi"
            options={filterTypeOptions}
            placeholder="Filter turini tanlang"
            onChange={(v) => setField("filterType", v)}
          />

          {/* Filter value */}
          {filterType && renderFilterValueSelectField()}

          {/* Action */}
          <SelectField
            required
            label="Amal"
            value={action}
            options={actionTypeOptions}
            placeholder="Amalni tanlang"
            onChange={(v) => setField("action", v)}
          />

          {/* Amount */}
          <InputField
            min={1}
            required
            type="number"
            name="amount"
            label="Miqdor"
            value={amount}
            placeholder="Tanga miqdorini kiriting"
            onChange={(e) => setField("amount", e.target.value)}
          />

          {/* Reason */}
          <InputField
            required
            name="reason"
            label="Sabab"
            value={reason}
            type="textarea"
            placeholder="Sababni kiriting..."
            onChange={(e) => setField("reason", e.target.value)}
          />

          {/* Submit */}
          <Button className="w-full" disabled={!amount || !reason?.trim()}>
            Tarqatish
          </Button>
        </InputGroup>
      </Card>

      {/* Modal */}
      <ConfirmDistributionModal />
    </div>
  );
};

export default CoinDistributionPage;
