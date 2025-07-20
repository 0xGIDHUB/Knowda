import CardanoWalletHeaderComponent from "@/components/CardanoWalletHeaderComponent";

export default function Layout({ children }: any) {
  return (
    <>
      <CardanoWalletHeaderComponent />
      <main>{children}</main>
    </>
  );
}