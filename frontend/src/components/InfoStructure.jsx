export default function InfoStructure({ structure }) {

  const name = structure.name;
  const level = structure.level;
  const upgrading = structure.state.upgrading;


  return (
    <div className="structure-info-quad">
      <h3>{name}</h3>
      <p>Level: {level}</p>
      <p>Upgrading: {upgrading ? "Yes" : "No"}</p>
    </div>
  );
}
